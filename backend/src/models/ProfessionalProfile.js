import mongoose from 'mongoose';
import { normalizeProfession } from '../utils/professionHelpers.js';

const professionalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    profession: {
      type: String,
      required: true,
      enum: [
        'Doctor',
        'CA',
        'Lawyer',
        'Consultant',
        'Therapist',
        'Tutor',
        'Trainer',
        'Nutritionist',
        'Coach',
        'Freelancer',
        'Other',
      ],
      default: 'Doctor',
    },
    specialization: {
      type: String,
      default: '',
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    businessName: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    googleMapUrl: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: 'Bhubaneswar',
      trim: true,
    },
    state: {
      type: String,
      default: 'Odisha',
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    bookingSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
      index: true,
    },
    consultationFee: {
      type: Number,
      default: 500,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi'],
    },
    yearsOfExperience: {
      type: Number,
      default: 5,
      min: 0,
    },
    onlineConsultation: {
      type: Boolean,
      default: true,
    },
    offlineConsultation: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'BLOCKED'],
      default: 'ACTIVE',
      index: true,
    },
    plan: {
      type: String,
      enum: ['FREE', 'PRO'],
      default: 'FREE',
      index: true,
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    bookingType: {
      type: String,
      enum: ['TIME_SLOT', 'QUEUE'],
      default: 'TIME_SLOT',
      index: true,
    },
    queueSettings: {
      dailyLimit: {
        type: Number,
        default: 50,
        min: 1,
        max: 500,
      },
      queueStartTime: {
        type: String,
        default: '09:00',
      },
      queueEndTime: {
        type: String,
        default: '18:00',
      },
      lastBookingTime: {
        type: String,
        default: '17:00',
      },
      estimatedServiceTimeMinutes: {
        type: Number,
        default: 15,
        min: 1,
        max: 180,
      },
      allowOnlineQueue: {
        type: Boolean,
        default: true,
      },
      currentCallingNumber: {
        type: Number,
        default: 0,
      },
    },
    bookingSettings: {
      appointmentDuration: {
        type: Number,
        default: 30,
        min: 5,
      },
      bufferTime: {
        type: Number,
        default: 10,
        min: 0,
      },
      minNoticeMinutes: {
        type: Number,
        default: 0,
        min: 0,
      },
      maxAdvanceDays: {
        type: Number,
        default: 60,
        min: 1,
        max: 365,
      },
      allowSameDayBooking: {
        type: Boolean,
        default: true,
      },
      earlyArrivalMinutes: {
        type: Number,
        default: 15,
        min: 0,
        max: 120,
      },
      lateGraceMinutes: {
        type: Number,
        default: 10,
        min: 0,
        max: 120,
      },
      noShowThresholdMinutes: {
        type: Number,
        default: 15,
        min: 0,
        max: 120,
      },
      holdDurationMinutes: {
        type: Number,
        default: 5,
        min: 1,
        max: 30,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-normalize compound/custom profession labels to canonical enum before validation
professionalProfileSchema.pre('validate', function (next) {
  if (this.profession) {
    this.profession = normalizeProfession(this.profession);
  }
  next();
});

export const ProfessionalProfile = mongoose.model('ProfessionalProfile', professionalProfileSchema);
