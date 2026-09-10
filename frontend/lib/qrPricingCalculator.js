/**
 * Centralized Isomorphic Pricing Calculator for Professional SaaS Dashboard + Hardware Kit
 */

export const QR_BANNER_PLANS = {
  MONTHLY: {
    key: 'MONTHLY',
    title: '1 Month Pro SaaS',
    durationMonths: 1,
    baseMonthlyRate: 499,
    discountPercent: 0,
    deliveryFee: 199,
    badge: 'Monthly',
    popular: false,
    features: [
      'Full BookSaathi Pro SaaS Dashboard Access',
      'Unlimited Appointments & Consultation Slots',
      'Instant Digital Vector QR Code & Slip Generator',
      'WhatsApp & SMS Patient Reminders',
      'Standard Courier Delivery (₹199)',
    ],
  },
  QUARTERLY: {
    key: 'QUARTERLY',
    title: '3 Months Pro SaaS',
    durationMonths: 3,
    baseMonthlyRate: 499,
    discountPercent: 13,
    deliveryFee: 199,
    badge: 'Quarterly',
    popular: false,
    features: [
      'Full BookSaathi Pro SaaS Dashboard Access',
      'Unlimited Appointments & Consultation Slots',
      'Peak Hours & Revenue Growth Analytics',
      'Instant Digital High-Res QR Kit',
      'Standard Courier Delivery (₹199)',
    ],
  },
  HALF_YEARLY: {
    key: 'HALF_YEARLY',
    title: '6 Months Pro SaaS + FREE Kit',
    durationMonths: 6,
    baseMonthlyRate: 499,
    discountPercent: 26,
    deliveryFee: 0,
    badge: 'Best Value',
    popular: true,
    features: [
      '6 Months Complete Pro SaaS Dashboard Access',
      '1x Acrylic QR Desk Standee (100% FREE)',
      '1x Clinic Wall Vinyl Banner (100% FREE)',
      '100% FREE Express Courier Delivery (₹199 Off)',
      'Priority 24/7 Dedicated Support',
    ],
  },
  YEARLY: {
    key: 'YEARLY',
    title: '1 Year Pro SaaS + FREE Kit',
    durationMonths: 12,
    baseMonthlyRate: 499,
    discountPercent: 40,
    deliveryFee: 0,
    badge: 'Save 40%',
    popular: false,
    features: [
      '12 Months Complete Pro SaaS Dashboard Access',
      '1x Acrylic QR Desk Standee (100% FREE)',
      '1x Clinic Wall Vinyl Banner (100% FREE)',
      '100% FREE Express Courier Delivery (₹199 Off)',
      'Lifetime Standee Replacement + VIP Support',
    ],
  },
};

export function calculateQrBannerPrice(planKey) {
  const plan = QR_BANNER_PLANS[planKey] || QR_BANNER_PLANS.HALF_YEARLY;

  const baseMonthlyRate = plan.baseMonthlyRate;
  const subtotal = baseMonthlyRate * plan.durationMonths;

  let discountAmount = 0;
  if (plan.discountPercent > 0) {
    discountAmount = Math.round((subtotal * plan.discountPercent) / 100);
  }

  const discountedSubscriptionPrice = subtotal - discountAmount;

  // FREE Delivery rule for 6 months and 1 year
  const isOrderFeeFree = plan.durationMonths >= 6;
  const orderDeliveryFee = isOrderFeeFree ? 0 : 199;

  const finalPayableAmount = discountedSubscriptionPrice + orderDeliveryFee;
  const totalSavings = discountAmount + (isOrderFeeFree ? 199 : 0);

  return {
    planKey: plan.key,
    planTitle: plan.title,
    durationMonths: plan.durationMonths,
    baseMonthlyRate,
    subtotal,
    discountPercent: plan.discountPercent,
    discountAmount,
    discountedSubscriptionPrice,
    orderDeliveryFee,
    isOrderFeeFree,
    finalPayableAmount,
    totalSavings,
    effectiveMonthlyRate: Math.round(discountedSubscriptionPrice / plan.durationMonths),
    currency: 'INR',
  };
}
