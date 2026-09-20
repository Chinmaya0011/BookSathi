import mongoose from 'mongoose';
import { timeToMinutes, minutesToTime, createUtcDateFromLocal } from '../utils/dateHelpers.js';

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
    bookingType: {
      type: String,
      enum: ['TIME_SLOT', 'QUEUE'],
      default: 'TIME_SLOT',
      index: true,
    },
    queueNumber: {
      type: Number,
      min: 1,
      index: true,
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    dateString: {
      type: String, // YYYY-MM-DD (in Asia/Kolkata)
      required: true,
      index: true,
    },
    startTime: {
      type: String, // HH:mm
      default: '09:00',
    },
    endTime: {
      type: String, // HH:mm
      default: '09:30',
    },
    startMinutes: {
      type: Number, // 0 - 1439
      min: 0,
      max: 1439,
      index: true,
    },
    endMinutes: {
      type: Number, // 1 - 1440
      min: 1,
      max: 1440,
      index: true,
    },
    startAt: {
      type: Date, // UTC Date
      index: true,
    },
    endAt: {
      type: Date, // UTC Date
      index: true,
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
        'HOLD',
        'BOOKED',
        'DONE',
        'CANCELLED',
        'CONFIRMED',
        'PENDING',
        'WAITING',
        'CALLED',
        'IN_PROGRESS',
        'COMPLETED',
        'REJECTED',
        'NO_SHOW',
        'HELD',
        'EXPIRED',
        'RESCHEDULE_REQUESTED',
      ],
      default: 'BOOKED',
      index: true,
    },
    rescheduleRequest: {
      requestedDate: { type: String }, // YYYY-MM-DD
      requestedTime: { type: String }, // HH:mm
      requestedBy: { type: String, enum: ['USER', 'CUSTOMER', 'GUEST', 'PROFESSIONAL', 'ADMIN'] },
      reason: { type: String, default: '' },
      requestedAt: { type: Date },
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['USER', 'CUSTOMER', 'GUEST', 'PROFESSIONAL', 'ADMIN', 'SYSTEM'],
    },
    holdExpiresAt: {
      type: Date,
      default: null,
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
    cancelTokenHash: {
      type: String,
      default: null,
      select: false, // Never leaked in list/get queries
      index: true,
    },
    cancelAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lastCancelAttemptAt: {
      type: Date,
      default: null,
      select: false,
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
    /**
     * DPDP ACT, 2023 COMPLIANCE NOTE:
     * - Customer phone, customer email, and consultation notes constitute Digital Personal Data under India's DPDP Act, 2023.
     * - `reason`: Patient-provided booking complaint / visit summary (patient-visible).
     * - `notes`: Private consultation & clinical observations (professional + admin only, strictly restricted).
     * - `notesUpdatedAt`, `notesUpdatedBy`: Audit metadata for consultation notes modification.
     * - Data Retention / Deletion Policy Hook: Personal identifiable data and clinical notes are subject to periodic retention schedules and data erasure requests.
     */
    notes: {
      type: String,
      default: '',
      select: false, // Private clinical/consultation data: never fetched by default
    },
    notesUpdatedAt: {
      type: Date,
      default: null,
    },
    notesUpdatedBy: {
      type: String,
      enum: ['PROFESSIONAL', 'ADMIN', 'SYSTEM'],
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
    },
    // Timestamps for lifecycle
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

// Pre-validate hook to calculate integer minutes and UTC timestamps
appointmentSchema.pre('validate', function () {
  if (this.startTime && (this.startMinutes === undefined || this.startMinutes === null)) {
    this.startMinutes = timeToMinutes(this.startTime);
  }
  if (!this.endTime && this.startTime && this.duration) {
    this.endTime = minutesToTime(this.startMinutes + this.duration);
  }
  if (this.endTime && (this.endMinutes === undefined || this.endMinutes === null)) {
    this.endMinutes = timeToMinutes(this.endTime);
  }
  if (this.dateString && this.startMinutes !== undefined && !this.startAt) {
    this.startAt = createUtcDateFromLocal(this.dateString, this.startMinutes, this.timezone || 'Asia/Kolkata');
  }
  if (this.dateString && this.endMinutes !== undefined && !this.endAt) {
    this.endAt = createUtcDateFromLocal(this.dateString, this.endMinutes, this.timezone || 'Asia/Kolkata');
  }
  if (!this.appointmentDate && this.dateString) {
    const [year, month, day] = this.dateString.split('-').map(Number);
    this.appointmentDate = new Date(Date.UTC(year, month - 1, day));
  }
  if ((this.status === 'HOLD' || this.status === 'HELD') && !this.holdExpiresAt) {
    this.holdExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes default TTL
  }
});

// Indexes for high performance querying & overlap lookups
appointmentSchema.index({ professionalId: 1, dateString: 1 });
appointmentSchema.index({ professionalId: 1, dateString: 1, status: 1 });
appointmentSchema.index({ professionalId: 1, status: 1 });
appointmentSchema.index({ professionalId: 1, dateString: 1, startMinutes: 1, endMinutes: 1, status: 1 });

appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ customerPhone: 1, status: 1 });
appointmentSchema.index({ professionalId: 1, idempotencyKey: 1 }, { sparse: true });

// TTL index for automatic expiration of temporary holds
appointmentSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

// Guard for exact start collision for TIME_SLOT bookings
appointmentSchema.index(
  { professionalId: 1, dateString: 1, startMinutes: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bookingType: 'TIME_SLOT',
      status: {
        $in: ['HOLD', 'HELD', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'BOOKED'],
      },
    },
  }
);

// Guard for duplicate queue numbers for QUEUE bookings on the same day
appointmentSchema.index(
  { professionalId: 1, dateString: 1, queueNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bookingType: 'QUEUE',
      queueNumber: { $exists: true },
      status: {
        $in: [
          'HOLD',
          'HELD',
          'PENDING',
          'CONFIRMED',
          'WAITING',
          'CALLED',
          'IN_PROGRESS',
          'BOOKED',
          'DONE',
          'COMPLETED',
        ],
      },
    },
  }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
