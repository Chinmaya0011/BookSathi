import mongoose from 'mongoose';

const blockedDateSchema = new mongoose.Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      required: true,
      index: true,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for exact timezone-agnostic date matching
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    allDay: {
      type: Boolean,
      default: true,
    },
    startTime: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24-hour format (HH:mm)'],
    },
    endTime: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24-hour format (HH:mm)'],
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

blockedDateSchema.index({ professionalId: 1, date: 1 });

export const BlockedDate = mongoose.model('BlockedDate', blockedDateSchema);
