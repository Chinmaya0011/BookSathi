import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['USER', 'PROFESSIONAL', 'ADMIN'],
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: [
        'APPOINTMENT_CREATED',
        'APPOINTMENT_CONFIRMED',
        'APPOINTMENT_REJECTED',
        'APPOINTMENT_CANCELLED',
        'APPOINTMENT_RESCHEDULED',
        'APPOINTMENT_RESCHEDULE_REQUESTED',
        'APPOINTMENT_COMPLETED',
        'APPOINTMENT_REMINDER',
        'PROFESSIONAL_APPROVAL',
        'SYSTEM_ALERT',
        'GENERAL',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
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

// Compound index for querying user notifications quickly
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ professionalId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
