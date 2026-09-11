import { ProfessionalProfile } from '../models/ProfessionalProfile.js';

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

  async upgradePlan({ userId, planKey = 'PRO', billingCycle = 'MONTHLY' }) {
    const now = new Date();
    let expiresAt = null;

    if (planKey === 'PRO') {
      expiresAt = new Date(now);
      if (billingCycle === 'YEARLY') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }
    }

    const updatedProfile = await ProfessionalProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          plan: planKey,
          planExpiresAt: expiresAt,
        },
      },
      { new: true }
    );

    return {
      success: true,
      plan: updatedProfile.plan,
      planExpiresAt: updatedProfile.planExpiresAt,
      isPro: updatedProfile.plan === 'PRO',
    };
  },
};
