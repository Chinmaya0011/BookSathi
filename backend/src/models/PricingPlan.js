import mongoose from 'mongoose';

const pricingPlanSchema = new mongoose.Schema(
  {
    planKey: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'SOLO_FREE',
        'PRO_MONTHLY',
        'PRO_QUARTERLY',
        'PRO_HALF_YEARLY',
        'PRO_YEARLY',
        'CLINIC_ENTERPRISE',
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['SOFTWARE', 'QR_BANNER_BUNDLE', 'ENTERPRISE'],
      default: 'SOFTWARE',
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 0, // 0 for free/lifetime
    },
    baseMonthlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    isFreeDeliveryEligible: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: '',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    features: {
      maxServices: { type: Number, default: 3 },
      customBookingLink: { type: Boolean, default: true },
      qrStandeeIncluded: { type: Boolean, default: false },
      wallBannerIncluded: { type: Boolean, default: false },
      instantPdfSlips: { type: Boolean, default: true },
      whatsappConfirmations: { type: Boolean, default: true },
      revenueAnalytics: { type: Boolean, default: true },
      zeroPlatformCommission: { type: Boolean, default: true },
      prioritySupport: { type: Boolean, default: false },
    },
    featureBullets: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);
