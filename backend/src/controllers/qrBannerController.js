import { qrBannerService } from '../services/qrBannerService.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getPlans = async (req, res, next) => {
  try {
    const plans = await qrBannerService.getPlans();
    return successResponse(res, 200, 'QR and Banner plans retrieved', plans);
  } catch (err) {
    next(err);
  }
};

export const getMyOrder = async (req, res, next) => {
  try {
    const profile = req.profile || (await ProfessionalProfile.findOne({ userId: req.user._id }));
    if (!profile) {
      return successResponse(res, 200, 'Current order status retrieved', {
        hasOrder: false,
        order: null,
      });
    }

    const result = await qrBannerService.getMyOrder(profile._id);
    return successResponse(res, 200, 'Current order status retrieved', result);
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { planKey, bannerDesignId, shippingAddress, customization } = req.body;

    if (!planKey || !shippingAddress || !shippingAddress.recipientName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return errorResponse(res, 400, 'Complete shipping address and plan selection are required');
    }

    const profile = await ProfessionalProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Professional profile not found');
    }

    const result = await qrBannerService.createOrder({
      professionalId: profile._id,
      userId: req.user._id,
      planKey,
      bannerDesignId,
      shippingAddress,
      customization,
    });

    return successResponse(res, 201, 'Order created successfully. Proceed to payment.', result);
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;
    if (!orderId) {
      return errorResponse(res, 400, 'Order ID is required');
    }

    const profile = await ProfessionalProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Professional profile not found');
    }

    const order = await qrBannerService.verifyPayment({
      orderId,
      professionalId: profile._id,
      paymentMethod,
    });

    return successResponse(res, 200, 'Payment verified & QR Banner package activated!', order);
  } catch (err) {
    next(err);
  }
};
