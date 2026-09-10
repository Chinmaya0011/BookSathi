import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().min(10, 'Valid phone number is required').optional(),
  profession: z.enum([
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
  ]).optional(),
  specialization: z.string().optional(),
  profileImage: z.string().optional(),
  bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
  googleMapUrl: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  consultationFee: z.number().min(0, 'Fee must be 0 or positive').optional(),
  currency: z.string().optional(),
  languages: z.array(z.string()).optional(),
  yearsOfExperience: z.number().min(0).optional(),
  onlineConsultation: z.boolean().optional(),
  offlineConsultation: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  bookingSettings: z.object({
    appointmentDuration: z.number().min(5, 'Duration must be at least 5 minutes').max(360).optional(),
    bufferTime: z.number().min(0, 'Buffer time cannot be negative').max(120).optional(),
    minNoticeMinutes: z.number().min(0).optional(),
    maxAdvanceDays: z.number().min(1).max(365).optional(),
    allowSameDayBooking: z.boolean().optional(),
    earlyArrivalMinutes: z.number().min(0).optional(),
    lateGraceMinutes: z.number().min(0).optional(),
    noShowThresholdMinutes: z.number().min(0).optional(),
    holdDurationMinutes: z.number().min(1).max(30).optional(),
  }).optional(),
});

export const updateSlugSchema = z.object({
  bookingSlug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});
