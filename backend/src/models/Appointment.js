import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    appointmentCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      required: true,
      index: true,
    },
    appointmentTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppointmentType',
    },
    appointmentTypeName: {
      type: String,
      default: 'General Consultation',
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    dateString: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // HH:mm
      required: true,
    },
    endTime: {
      type: String, // HH:mm
      required: true,
    },
    duration: {
      type: Number,
      default: 30,
    },
    buffer: {
      type: Number,
      default: 0,
    },
    fee: {
      type: Number,
      default: 500,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    bookingSource: {
      type: String,
      enum: ['ONLINE', 'WALK_IN', 'PHONE', 'WHATSAPP', 'MANUAL'],
      default: 'ONLINE',
      index: true,
    },
    consultationType: {
      type: String,
      enum: ['IN_PERSON', 'ONLINE', 'VIDEO', 'AUDIO'],
      default: 'IN_PERSON',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'HELD',
        'CONFIRMED',
        'REJECTED',
        'ARRIVED',
        'WAITING',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
        'RESCHEDULE_REQUESTED',
        'RESCHEDULED',
        'EXPIRED',
      ],
      default: 'PENDING',
      index: true,
    },
    rescheduleRequest: {
      requestedDate: { type: String }, // YYYY-MM-DD
      requestedTime: { type: String }, // HH:mm
      requestedBy: { type: String, enum: ['USER', 'PROFESSIONAL'] },
      reason: { type: String, default: '' },
      requestedAt: { type: Date },
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['USER', 'PROFESSIONAL', 'ADMIN'],
    },
    holdExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    holdToken: {
      type: String,
      default: null,
      index: true,
    },
    idempotencyKey: {
      type: String,
      default: null,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'NOT_REQUIRED', 'PAY_AT_CLINIC'],
      default: 'PENDING',
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ['ONLINE', 'PAY_AT_CLINIC', 'FREE'],
      default: 'ONLINE',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    notes: {
      type: String,
      default: '',
      select: false, // Hidden by default from public / lean queries to protect privacy
    },
    cancelReason: {
      type: String,
      default: '',
    },
    // Timestamps for lifecycle & analytics
    confirmedAt: {
      type: Date,
      default: null,
    },
    arrivedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    noShowAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for slot generation and dashboard querying
appointmentSchema.index({ professionalId: 1, dateString: 1 });
appointmentSchema.index({ professionalId: 1, dateString: 1, status: 1 });
appointmentSchema.index({ professionalId: 1, status: 1 });

appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ customerPhone: 1, status: 1 });
appointmentSchema.index({ professionalId: 1, idempotencyKey: 1 }, { sparse: true });

// Critical Double Booking Prevention Partial Unique Index:
// Guarantees at database-level that no two active appointments (or active non-expired holds)
// can occupy the exact same slot for the same professional!
appointmentSchema.index(
  { professionalId: 1, dateString: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS', 'HELD'],
      },
    },
  }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);

