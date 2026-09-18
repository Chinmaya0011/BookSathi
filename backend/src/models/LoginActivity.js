import mongoose from 'mongoose';

const loginActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    userRole: {
      type: String,
      enum: ['USER', 'PROFESSIONAL', 'ADMIN'],
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'LOGOUT',
        'SESSION_REPLACED',
        'SESSION_EXPIRED',
        'SESSION_REVOKED',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'revoked'],
      default: 'success',
      index: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
      default: 'desktop',
    },
    browser: {
      type: String,
      default: 'Unknown Browser',
    },
    operatingSystem: {
      type: String,
      default: 'Unknown OS',
    },
    sessionId: {
      type: String,
      default: '',
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user query and admin reporting
loginActivitySchema.index({ userId: 1, createdAt: -1 });
loginActivitySchema.index({ createdAt: -1 });
loginActivitySchema.index({ userRole: 1, eventType: 1, createdAt: -1 });

export const LoginActivity = mongoose.model('LoginActivity', loginActivitySchema);
