import mongoose from 'mongoose';

const qrBannerOrderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
      enum: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'],
      required: true,
    },
    planTitle: {
      type: String,
      required: true,
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    bannerDesignId: {
      type: String,
      enum: ['classic-indigo', 'clinical-emerald', 'gold-minimal'],
      default: 'classic-indigo',
    },
    customization: {
      doctorName: { type: String, default: '' },
      specialization: { type: String, default: '' },
      clinicAddress: { type: String, default: '' },
      phone: { type: String, default: '' },
      qrTargetUrl: { type: String, default: '' },
    },
    shippingAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String, default: '' },
    },
    pricingBreakdown: {
      baseMonthlyRate: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      discountPercent: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      orderDeliveryFee: { type: Number, default: 0 },
      isOrderFeeFree: { type: Boolean, default: false },
      finalPayableAmount: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'PAYMENT_PENDING',
        'ORDER_PLACED',
        'IN_PRINTING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PAYMENT_PENDING',
      index: true,
    },
    paymentId: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: 'UPI',
    },
    paidAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    courierPartner: {
      type: String,
      default: 'BlueDart / Delhivery Express',
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    subscriptionStartsAt: {
      type: Date,
    },
    subscriptionExpiresAt: {
      type: Date,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

qrBannerOrderSchema.index({ professionalId: 1, isActive: 1 });
qrBannerOrderSchema.index({ professionalId: 1, createdAt: -1 });

export const QrBannerOrder = mongoose.model('QrBannerOrder', qrBannerOrderSchema);
