import mongoose from 'mongoose';

const timeRangeSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24-hour format (HH:mm)'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$|^24:00$/, 'Time must be in 24-hour format (HH:mm)'],
    },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    timeRanges: {
      type: [timeRangeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookup and uniqueness
availabilitySchema.index({ professionalId: 1, dayOfWeek: 1 }, { unique: true });

export const Availability = mongoose.model('Availability', availabilitySchema);
