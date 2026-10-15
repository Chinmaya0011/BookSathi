import crypto from 'crypto';
import { QrBannerOrder } from '../models/QrBannerOrder.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { getProfessionalPublicUrl } from '../utils/urlHelpers.js';
import { QR_BANNER_PLANS, calculateQrBannerPrice } from './qrPricingEngine.js';
import { getPaymentGateway } from './payment/index.js';

export const qrBannerService = {
  /**
   * Return available plans and pricing rules
   */
  async getPlans() {
    const plansArray = Object.keys(QR_BANNER_PLANS).map((key) => {
      const calculation = calculateQrBannerPrice(key);
      const planMeta = QR_BANNER_PLANS[key];
      return {
        ...planMeta,
        pricing: calculation,
      };
    });
    return plansArray;
  },

  /**
   * Get active or latest QR/Banner order for authenticated professional
   */
  async getMyOrder(professionalId) {
    const now = new Date();
    const activeOrder = await QrBannerOrder.findOne({
      professionalId,
      isActive: true,
      subscriptionExpiresAt: { $gt: now },
    })
      .select('_id planKey bannerDesignId isActive status trackingNumber createdAt subscriptionExpiresAt deliveryAddress')
      .sort({ createdAt: -1 })
      .lean();

    if (activeOrder) {
      return {
        hasActivePurchase: true,
        order: activeOrder,
      };
    }

    // Check if there is any pending or recent order
    const latestOrder = await QrBannerOrder.findOne({ professionalId })
      .select('_id planKey bannerDesignId isActive status trackingNumber createdAt subscriptionExpiresAt deliveryAddress')
      .sort({ createdAt: -1 })
      .lean();

    return {
      hasActivePurchase: false,
      order: latestOrder || null,
    };
  },

  /**
   * Create new QR Code + Banner Order
   */
  async createOrder({ professionalId, userId, planKey, bannerDesignId, shippingAddress, customization }) {
    const profile = await ProfessionalProfile.findById(professionalId);
    if (!profile) {
      const err = new Error('Professional profile not found');
      err.statusCode = 404;
      throw err;
    }

    // Server-side calculated and verified price
    const pricing = calculateQrBannerPrice(planKey);

    // Generate unique order code
    const orderCode = `QRO-${Math.floor(100000 + Math.random() * 900000)}`;

    // Prepare customization snapshot
    const customData = {
      doctorName: customization?.doctorName || profile.name,
      specialization: customization?.specialization || profile.specialization || profile.profession,
      clinicAddress: customization?.clinicAddress || [profile.address, profile.city].filter(Boolean).join(', '),
      phone: customization?.phone || profile.phone,
      qrTargetUrl: getProfessionalPublicUrl(profile.bookingSlug),
    };

    const newOrder = await QrBannerOrder.create({
      orderCode,
      professionalId,
      userId,
      planKey: pricing.planKey,
      planTitle: pricing.planTitle,
      durationMonths: pricing.durationMonths,
      bannerDesignId: bannerDesignId || 'classic-indigo',
      customization: customData,
      shippingAddress: {
        recipientName: shippingAddress.recipientName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        landmark: shippingAddress.landmark || '',
      },
      pricingBreakdown: pricing,
      paymentStatus: 'PENDING',
      orderStatus: 'PAYMENT_PENDING',
      isActive: false,
    });

    let paymentSessionId = null;
    let gatewayOrderId = null;
    try {
      const gateway = getPaymentGateway('CASHFREE');
      const gatewayOrder = await gateway.createOrder({
        amount: pricing.finalPayableAmount,
        currency: 'INR',
        receipt: orderCode,
        customer: {
          id: userId?.toString() || professionalId.toString(),
          name: shippingAddress.recipientName || profile.name,
          phone: shippingAddress.phone || profile.phone,
          email: profile.email,
        },
        notes: {
          orderCode,
          type: 'QR_BANNER_KIT',
          planKey: pricing.planKey,
        },
      });

      paymentSessionId = gatewayOrder.paymentSessionId;
      gatewayOrderId = gatewayOrder.orderId;
      newOrder.paymentSessionId = paymentSessionId;
      newOrder.cashfreeOrderId = gatewayOrderId;
      newOrder.isDemo = Boolean(gatewayOrder.isDemo);
      await newOrder.save();
    } catch (e) {
      console.warn('QR Banner Cashfree order creation fallback:', e.message);
    }

    return {
      order: newOrder,
      paymentSessionId,
      gatewayOrderId,
      pricing,
      isDemo: Boolean(newOrder.isDemo),
    };
  },

  /**
   * Verify and activate QR Code + Banner order
   */
  async verifyPayment({ orderId, professionalId, paymentMethod = 'CASHFREE' }) {
    const order = await QrBannerOrder.findOne({
      _id: orderId,
      professionalId,
    });

    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    const gateway = getPaymentGateway('CASHFREE');
    if (order.cashfreeOrderId) {
      const verifyRes = await gateway.verifyPayment({ orderId: order.cashfreeOrderId });
      if (!verifyRes.isValid || verifyRes.status === 'FAILED') {
        const err = new Error(verifyRes.error || 'Payment verification failed with Cashfree.');
        err.statusCode = 400;
        throw err;
      }
    }

    const isDemo = Boolean(order.isDemo || order.cashfreeOrderId?.includes('_demo_') || order.paymentSessionId?.startsWith('session_demo_'));
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + order.durationMonths);

    // Estimated delivery 4-6 business days
    const estDelivery = new Date(now);
    estDelivery.setDate(estDelivery.getDate() + (order.durationMonths >= 6 ? 4 : 6));

    const trackingNumber = `BD-${Math.floor(10000000 + Math.random() * 90000000)}`;

    order.paymentStatus = isDemo ? 'DEMO_PAID' : 'PAID';
    order.orderStatus = 'ORDER_PLACED';
    order.isDemo = isDemo;
    order.paymentId = `PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    order.paymentMethod = isDemo ? 'CASHFREE_DEMO' : 'CASHFREE';
    order.paidAt = now;
    order.trackingNumber = trackingNumber;
    order.estimatedDeliveryDate = estDelivery;
    order.subscriptionStartsAt = now;
    order.subscriptionExpiresAt = expiresAt;
    order.isActive = true;

    await order.save();

    // Deactivate previous orders for this professional if any
    await QrBannerOrder.updateMany(
      { professionalId, _id: { $ne: order._id } },
      { $set: { isActive: false } }
    );

    return order;
  },
};
