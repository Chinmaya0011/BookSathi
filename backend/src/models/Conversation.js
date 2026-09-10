import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['USER', 'PROFESSIONAL', 'ADMIN'],
          required: true,
        },
      },
    ],
    type: {
      type: String,
      enum: ['DIRECT', 'SUPPORT'],
      default: 'DIRECT',
    },
    // Optional reference if conversation is between a User and a Professional
    professionalProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfessionalProfile',
      default: null,
    },
    // Optional reference to a specific appointment relation
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    lastMessage: {
      text: { type: String, default: '' },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      senderName: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
