import mongoose from 'mongoose';

const appointmentTypeSchema = new mongoose.Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Appointment type name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: Number,
      default: 30,
      min: 5,
    },
    bufferTime: {
      type: Number,
      default: null, // If null, uses professional's default bufferTime
    },
    fee: {
      type: Number,
      default: 500,
      min: 0,
    },
    consultationType: {
      type: String,
      enum: ['VIDEO', 'AUDIO', 'IN_PERSON', 'ANY'],
      default: 'VIDEO',
    },
    onlineAvailable: {
      type: Boolean,
      default: true,
    },
    offlineAvailable: {
      type: Boolean,
      default: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const AppointmentType = mongoose.model('AppointmentType', appointmentTypeSchema);
