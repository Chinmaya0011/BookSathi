import mongoose from 'mongoose';

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

export const ProfessionalProfile = mongoose.model('ProfessionalProfile', professionalProfileSchema);
