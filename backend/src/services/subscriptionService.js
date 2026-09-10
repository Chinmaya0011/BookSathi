import { ProfessionalSubscription } from '../models/ProfessionalSubscription.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { calculateQrBannerPrice, QR_BANNER_PLANS } from './qrPricingEngine.js';

export const ONBOARDING_PRICING_PLANS = [
  {
    planKey: 'SOLO_FREE',
    title: 'Solo Practitioner',
    category: 'SOFTWARE',
    durationMonths: 0,
    baseMonthlyRate: 0,
    finalPrice: 0,
    deliveryFee: 0,
    badge: 'Free Forever',
    isPopular: false,
    tagline: 'Ideal for independent doctors & advisors starting out.',
    features: {
      maxServices: 3,
      customBookingLink: true,
      qrStandeeIncluded: false,
      wallBannerIncluded: false,
      freeDeliveryEligible: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
    bullets: [
      'Personal shareable booking link',
      'Custom weekly availability & breaks',
      'Pay at clinic & UPI payment collection',
      'Instant digital PDF slip generation',
      '0% platform commission on bookings',
    ],
  },
  {
    planKey: 'PRO_MONTHLY',
    title: 'Pro Practice (Monthly)',
    category: 'SOFTWARE',
    durationMonths: 1,
    baseMonthlyRate: 499,
    finalPrice: 499,
    deliveryFee: 199,
    badge: 'Flexible',
    isPopular: false,
    tagline: 'Complete automation with optional physical standee.',
    features: {
      maxServices: 20,
      customBookingLink: true,
      qrStandeeIncluded: true,
      wallBannerIncluded: false,
      freeDeliveryEligible: false,
      advancedAnalytics: true,
      prioritySupport: true,
    },
    bullets: [
      'Unlimited consultation services',
      '1x Premium Acrylic Desk Standee',
      'Automated SMS & WhatsApp notifications',
      'Advanced revenue & peak-hour analytics',
      'Priority 24/7 dedicated support',
    ],
  },
  {
    planKey: 'PRO_HALF_YEARLY',
    title: 'Pro Practice (6 Months)',
    category: 'QR_BANNER_BUNDLE',
    durationMonths: 6,
    baseMonthlyRate: 499,
    finalPrice: 2199,
    deliveryFee: 0,
    badge: 'Best Value',
    isPopular: true,
    tagline: 'Most recommended for growing clinics & chambers.',
    features: {
      maxServices: 999,
      customBookingLink: true,
      qrStandeeIncluded: true,
      wallBannerIncluded: true,
      freeDeliveryEligible: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
    bullets: [
      'Save 26% on SaaS subscription (₹795 Off)',
      '1x Premium Acrylic Desk Standee (FREE)',
      '1x Weatherproof Clinic Wall Vinyl Banner (FREE)',
      '100% FREE Courier Delivery (₹199 Off)',
      'Full VIP Practice Growth Advisor',
    ],
  },
  {
    planKey: 'PRO_YEARLY',
    title: 'Pro Practice (Annual)',
    category: 'QR_BANNER_BUNDLE',
    durationMonths: 12,
    baseMonthlyRate: 499,
    finalPrice: 3599,
    deliveryFee: 0,
    badge: 'Save 40%',
    isPopular: false,
    tagline: 'Maximum savings with lifetime standee replacement.',
    features: {
      maxServices: 999,
      customBookingLink: true,
      qrStandeeIncluded: true,
      wallBannerIncluded: true,
      freeDeliveryEligible: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
    bullets: [
      'Save 40% on SaaS subscription (₹2,389 Off)',
      '1x Premium Acrylic Standee (Lifetime Replacement)',
      '1x Weatherproof Clinic Wall Vinyl Banner (FREE)',
      '100% FREE Courier Delivery (₹199 Off)',
      'Full VIP Priority Support & Setup',
    ],
  },
];

export const subscriptionService = {
  /**
   * Return master onboarding & subscription plans
   */
  async getPlans() {
    return ONBOARDING_PRICING_PLANS;
  },

  /**
   * Get active subscription for authenticated doctor
   */
  async getMySubscription(professionalId, userId) {
    let sub = await ProfessionalSubscription.findOne({
      professionalId,
      status: 'ACTIVE',
    }).sort({ createdAt: -1 });

    // If no subscription exists, create default SOLO_FREE
    if (!sub) {
      sub = await ProfessionalSubscription.create({
        professionalId,
        userId,
        planKey: 'SOLO_FREE',
        planTitle: 'Solo Practitioner (Free Forever)',
        billingCycle: 'FREE',
        status: 'ACTIVE',
        amountPaid: 0,
        features: {
          maxServices: 3,
          unlimitedBookings: true,
          qrStandeeIncluded: false,
          wallBannerIncluded: false,
          freeDeliveryEligible: false,
          advancedAnalytics: true,
          whatsappIntegration: true,
          prioritySupport: false,
        },
        startedAt: new Date(),
        expiresAt: null,
      });
    }

    return sub;
  },

  /**
   * Select or Upgrade Plan during onboarding or dashboard settings
   */
  async selectPlan({ professionalId, userId, planKey, paymentMethod = 'FREE' }) {
    const plan = ONBOARDING_PRICING_PLANS.find((p) => p.planKey === planKey);
    if (!plan) {
      const err = new Error(`Invalid plan: ${planKey}`);
      err.statusCode = 400;
      throw err;
    }

    const now = new Date();
    let expiresAt = null;
    if (plan.durationMonths > 0) {
      expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + plan.durationMonths);
    }

    // Deactivate previous subscriptions
    await ProfessionalSubscription.updateMany(
      { professionalId },
      { $set: { status: 'CANCELLED' } }
    );

    const newSub = await ProfessionalSubscription.create({
      professionalId,
      userId,
      planKey: plan.planKey,
      planTitle: plan.title,
      billingCycle: plan.durationMonths === 0 ? 'FREE' : plan.durationMonths === 1 ? 'MONTHLY' : plan.durationMonths === 6 ? 'HALF_YEARLY' : 'YEARLY',
      status: 'ACTIVE',
      amountPaid: plan.finalPrice,
      paymentMethod,
      features: plan.features,
      startedAt: now,
      expiresAt,
    });

    return newSub;
  },
};
