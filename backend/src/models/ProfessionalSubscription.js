import mongoose from 'mongoose';

const professionalSubscriptionSchema = new mongoose.Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planKey: {
      type: String,
      enum: [
        'SOLO_FREE',
        'PRO_MONTHLY',
        'PRO_QUARTERLY',
        'PRO_HALF_YEARLY',
        'PRO_YEARLY',
        'CLINIC_ENTERPRISE',
      ],
      default: 'SOLO_FREE',
      required: true,
    },
    planTitle: {
      type: String,
      default: 'Solo Practitioner (Free Forever)',
    },
    billingCycle: {
      type: String,
      enum: ['FREE', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'CUSTOM'],
      default: 'FREE',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'TRIAL', 'PENDING_PAYMENT', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    features: {
      maxServices: { type: Number, default: 5 },
      unlimitedBookings: { type: Boolean, default: true },
      qrStandeeIncluded: { type: Boolean, default: false },
      wallBannerIncluded: { type: Boolean, default: false },
      freeDeliveryEligible: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: true },
      whatsappIntegration: { type: Boolean, default: true },
      prioritySupport: { type: Boolean, default: false },
    },
    paymentId: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null, // null for lifetime free
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

professionalSubscriptionSchema.index({ professionalId: 1, status: 1 });

export const ProfessionalSubscription = mongoose.model(
  'ProfessionalSubscription',
  professionalSubscriptionSchema
);
