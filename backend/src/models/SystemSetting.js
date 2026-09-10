import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'GLOBAL_CONFIG',
    },
    platformName: {
      type: String,
      default: 'BookSaathi',
    },
    supportEmail: {
      type: String,
      default: 'support@booksaathi.in',
    },
    supportPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowNewRegistrations: {
      type: Boolean,
      default: true,
    },
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    smsNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    defaultCommissionPercent: {
      type: Number,
      default: 0,
    },
    minBookingNoticeMinutes: {
      type: Number,
      default: 30,
    },
    featureFlags: {
      qrStandeeDelivery: { type: Boolean, default: true },
      instantPdfSlips: { type: Boolean, default: true },
      onlinePayments: { type: Boolean, default: true },
      multiLanguageSupport: { type: Boolean, default: true },
      aiScheduleOptimizer: { type: Boolean, default: false },
    },
    customAnnouncement: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: '' },
      type: { type: String, enum: ['INFO', 'WARNING', 'SUCCESS'], default: 'INFO' },
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
