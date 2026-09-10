import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ['PROFESSIONAL', 'CUSTOMER'],
      required: true,
      default: 'PROFESSIONAL',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'PAYMENT_REFUND',
        'APPOINTMENT_SCHEDULE',
        'TECHNICAL_GLITCH',
        'PROFILE_VERIFICATION',
        'BILLING_INVOICE',
        'STAFF_BEHAVIOR',
        'OTHER',
      ],
      required: true,
      default: 'OTHER',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject line'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Please describe your grievance in detail'],
      trim: true,
      maxlength: 3000,
    },
    referenceCode: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    adminResponse: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
grievanceSchema.index({ status: 1, createdAt: -1 });
grievanceSchema.index({ userType: 1, createdAt: -1 });
grievanceSchema.index({ email: 1 });

export const Grievance = mongoose.model('Grievance', grievanceSchema);
