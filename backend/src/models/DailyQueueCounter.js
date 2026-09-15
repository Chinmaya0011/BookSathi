import mongoose from 'mongoose';

const dailyQueueCounterSchema = new mongoose.Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      required: true,
      index: true,
    },
    dateString: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    lastQueueNumber: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentServingNumber: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for atomic increment and unique daily lookup per professional
dailyQueueCounterSchema.index({ professionalId: 1, dateString: 1 }, { unique: true });

export const DailyQueueCounter = mongoose.model('DailyQueueCounter', dailyQueueCounterSchema);
