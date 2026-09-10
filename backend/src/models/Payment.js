import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'NETBANKING', 'WALLET', 'CASH', 'SIMULATED', 'GATEWAY', 'FREE'],
      default: 'SIMULATED',
    },
    paymentMode: {
      type: String,
      enum: ['ONLINE', 'PAY_AT_CLINIC', 'FREE'],
      default: 'ONLINE',
    },
    gatewayProvider: {
      type: String,
      enum: ['SIMULATED', 'RAZORPAY', 'STRIPE', 'CASHFREE', 'MANUAL_CASH', 'NONE'],
      default: 'SIMULATED',
    },
    gatewayOrderId: {
      type: String,
      default: '',
      index: true,
    },
    gatewayPaymentId: {
      type: String,
      default: '',
      index: true,
    },
    gatewaySignature: {
      type: String,
      default: '',
    },
    gatewayRawResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    refundStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'PROCESSED', 'FAILED'],
      default: 'NONE',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      default: '',
    },
    refundId: {
      type: String,
      default: '',
    },
    refundedAt: {
      type: Date,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ professionalId: 1, createdAt: -1 });
paymentSchema.index({ appointmentId: 1, status: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
