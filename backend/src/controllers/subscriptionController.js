import { subscriptionService } from '../services/subscriptionService.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getPlans = async (req, res, next) => {
  try {
    const plans = await subscriptionService.getPlans();
    return successResponse(res, 200, 'Pricing plans retrieved', plans);
  } catch (err) {
    next(err);
  }
};

export const getMySubscription = async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Professional profile not found');
    }

    const sub = await subscriptionService.getMySubscription(profile._id, req.user._id);
    return successResponse(res, 200, 'Current subscription retrieved', sub);
  } catch (err) {
    next(err);
  }
};

export const selectPlan = async (req, res, next) => {
  try {
    const { planKey = 'PRO', billingCycle = 'MONTHLY' } = req.body;

    const profile = await ProfessionalProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Professional profile not found');
    }

    const result = await subscriptionService.upgradePlan({
      userId: req.user._id,
      planKey,
      billingCycle,
    });

    return successResponse(res, 200, `Upgraded to ${planKey} successfully`, result);
  } catch (err) {
    next(err);
  }
};
