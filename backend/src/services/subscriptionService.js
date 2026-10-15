import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { ProfessionalSubscription } from '../models/ProfessionalSubscription.js';
import { User } from '../models/User.js';
import { getPaymentGateway } from './payment/index.js';
import { sendAndPersistNotification } from '../socket/socketEmitter.js';

export const PLANS = [
  {
    planKey: 'FREE',
    name: 'Free',
    price: '₹0',
    period: 'Free Forever',
    badge: 'Standard',
    features: [
      'Unlimited bookings',
      'Shareable booking link + clean slug',
      'Today dashboard with count badge',
      'Customer booking lookup (zero login)',
    ],
  },
  {
    planKey: 'PRO',
    name: 'Pro',
    price: '₹199',
    period: '₹199/month (or ₹1,499/year)',
    badge: '⭐ Pro Practice',
    features: [
      'Everything in Free',
      'Automated WhatsApp reminder before appointment',
      '1-Tap "Book Again" for returning customers',
      'Custom vanity booking slug handle',
      'Priority support tag on account',
    ],
  },
];

export const subscriptionService = {
  async getPlans() {
    return PLANS;
  },

  async getMySubscription(profileId, userId) {
    const profile = await ProfessionalProfile.findById(profileId);
    const now = new Date();
    const isPro =
      profile?.plan === 'PRO' && (!profile.planExpiresAt || new Date(profile.planExpiresAt) > now);

    return {
      plan: isPro ? 'PRO' : 'FREE',
      planExpiresAt: profile?.planExpiresAt || null,
      isPro,
    };
  },

  /**
   * Create an official Cashfree payment order for Pro membership subscription
   */
  async createSubscriptionOrder({ userId, planKey = 'PRO', billingCycle = 'MONTHLY' }) {
    const profile = await ProfessionalProfile.findOne({ userId });
    if (!profile) {
      const err = new Error('Professional profile not found');
      err.statusCode = 404;
      throw err;
    }

    const user = await User.findById(userId);
    const amount = billingCycle === 'YEARLY' ? 1499 : 199;
    const orderCode = `SUB-${billingCycle === 'YEARLY' ? 'YR' : 'MO'}-${Date.now().toString().slice(-6)}`;

    const gateway = getPaymentGateway('CASHFREE');
    const gatewayOrder = await gateway.createOrder({
      amount,
      currency: 'INR',
      receipt: orderCode,
      customer: {
        id: userId.toString(),
        name: profile.name,
        phone: profile.phone || user?.phone || '9999999999',
        email: profile.email || user?.email || 'pro@booksaathi.in',
      },
      notes: {
        type: 'PRO_SUBSCRIPTION',
        planKey,
        billingCycle,
        userId: userId.toString(),
        professionalId: profile._id.toString(),
        orderCode,
      },
    });

    const isDemo = Boolean(gatewayOrder.isDemo);

    // Record or update subscription in PENDING_PAYMENT state
    await ProfessionalSubscription.findOneAndUpdate(
      { professionalId: profile._id },
      {
        $set: {
          userId,
          professionalId: profile._id,
          planKey: billingCycle === 'YEARLY' ? 'PRO_YEARLY' : 'PRO_MONTHLY',
          planTitle: isDemo ? 'BookSaathi Pro Membership (Demo Mode)' : 'BookSaathi Pro Membership',
          billingCycle,
          status: 'PENDING_PAYMENT',
          isDemo,
          amountPaid: amount,
          paymentId: gatewayOrder.orderId,
        },
      },
      { upsert: true, new: true }
    );

    return {
      success: true,
      orderId: gatewayOrder.orderId,
      paymentSessionId: gatewayOrder.paymentSessionId,
      amount,
      billingCycle,
      planKey,
      orderCode,
      isDemo,
      demoNotice: gatewayOrder.demoNotice || undefined,
    };
  },

  /**
   * Verify Cashfree payment and activate Pro subscription
   */
  async verifySubscriptionPayment({ userId, orderId, planKey = 'PRO', billingCycle = 'MONTHLY' }) {
    const profile = await ProfessionalProfile.findOne({ userId });
    if (!profile) {
      const err = new Error('Professional profile not found');
      err.statusCode = 404;
      throw err;
    }

    const gateway = getPaymentGateway('CASHFREE');
    const verifyRes = await gateway.verifyPayment({ orderId });

    if (!verifyRes.isValid || verifyRes.status === 'FAILED') {
      const err = new Error(verifyRes.error || 'Payment confirmation pending or failed with Cashfree. Please retry.');
      err.statusCode = 400;
      throw err;
    }

    const isDemo = Boolean(verifyRes.isDemo);
    const now = new Date();
    // If already active, extend from current expiry date
    const baseDate = profile.planExpiresAt && new Date(profile.planExpiresAt) > now
      ? new Date(profile.planExpiresAt)
      : new Date(now);

    const expiresAt = new Date(baseDate);
    if (billingCycle === 'YEARLY') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const updatedProfile = await ProfessionalProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          plan: 'PRO',
          planExpiresAt: expiresAt,
          isDemoPlan: isDemo,
        },
      },
      { new: true }
    );

    const amount = billingCycle === 'YEARLY' ? 1499 : 199;
    await ProfessionalSubscription.findOneAndUpdate(
      { professionalId: profile._id },
      {
        $set: {
          userId,
          professionalId: profile._id,
          planKey: billingCycle === 'YEARLY' ? 'PRO_YEARLY' : 'PRO_MONTHLY',
          planTitle: isDemo ? 'BookSaathi Pro Membership (Demo Mode)' : 'BookSaathi Pro Membership',
          billingCycle,
          status: isDemo ? 'DEMO_ACTIVE' : 'ACTIVE',
          isDemo,
          amountPaid: amount,
          paymentId: orderId,
          startedAt: now,
          expiresAt,
        },
      },
      { upsert: true, new: true }
    );

    await sendAndPersistNotification({
      userId,
      professionalId: profile._id,
      recipientRole: 'PROFESSIONAL',
      type: 'SUBSCRIPTION_ACTIVATED',
      title: '⭐ Pro Membership Activated!',
      message: `Welcome to BookSaathi Pro! Your ${billingCycle.toLowerCase()} membership is active until ${expiresAt.toLocaleDateString('en-IN')}.`,
      link: '/dashboard/subscription',
    }).catch(() => {});

    return {
      success: true,
      plan: updatedProfile.plan,
      planExpiresAt: updatedProfile.planExpiresAt,
      isPro: true,
    };
  },

  async upgradePlan({ userId, planKey = 'PRO', billingCycle = 'MONTHLY' }) {
    if (planKey === 'FREE') {
      const updatedProfile = await ProfessionalProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            plan: 'FREE',
            planExpiresAt: null,
          },
        },
        { new: true }
      );
      return {
        success: true,
        plan: 'FREE',
        planExpiresAt: null,
        isPro: false,
      };
    }

    return this.createSubscriptionOrder({ userId, planKey, billingCycle });
  },
};
