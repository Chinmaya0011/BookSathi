import mongoose from 'mongoose';

const aiChatUsageSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD' in Asia/Kolkata
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['USER', 'PROFESSIONAL', 'ADMIN', 'GUEST'],
      default: 'GUEST',
    },
    plan: {
      type: String,
      default: 'FREE',
    },
    count: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for high-speed daily rate limit lookups and atomic increments
aiChatUsageSchema.index({ identifier: 1, date: 1 }, { unique: true });

export const AiChatUsage = mongoose.models.AiChatUsage || mongoose.model('AiChatUsage', aiChatUsageSchema);
