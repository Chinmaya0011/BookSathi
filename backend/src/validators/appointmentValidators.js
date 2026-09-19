import { z } from 'zod';

export const holdSlotSchema = z
  .object({
    appointmentTypeId: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format').optional(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format').optional(),
    website_hp: z.string().optional().default(''),
    formLoadTime: z.number().optional(),
  })
  .refine((data) => data.time || data.startTime, {
    message: 'Time slot selection is required',
    path: ['time'],
  });

export const publicBookingSchema = z
  .object({
    appointmentTypeId: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format').optional(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format').optional(),
    customerName: z
      .string()
      .trim()
      .min(2, 'Please enter your full name (minimum 2 characters)')
      .max(100, 'Name cannot exceed 100 characters'),
    customerPhone: z
      .string()
      .trim()
      .min(10, 'Please enter a valid 10-digit mobile number')
      .max(15, 'Phone number too long'),
    customerEmail: z.string().trim().email('Please enter a valid email address').optional().or(z.literal('')),
    reason: z.string().trim().max(500, 'Reason cannot exceed 500 characters').optional().default(''),
    paymentMode: z.enum(['ONLINE', 'PAY_AT_CLINIC', 'OFFLINE', 'FREE']).optional().default('ONLINE'),
    holdToken: z.string().optional(),
    idempotencyKey: z.string().optional(),
    website_hp: z.string().optional().default(''),
    formLoadTime: z.number().optional(),
    otp: z.string().optional(),
    otpVerificationToken: z.string().optional(),
  })
  .refine((data) => data.time || data.startTime, {
    message: 'Time slot selection is required',
    path: ['time'],
  });

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'HOLD',
    'HELD',
    'CONFIRMED',
    'BOOKED',
    'ARRIVED',
    'WAITING',
    'CALLED',
    'IN_PROGRESS',
    'COMPLETED',
    'DONE',
    'REJECTED',
    'CANCELLED',
    'NO_SHOW',
    'RESCHEDULED',
    'EXPIRED',
    'RESCHEDULE_REQUESTED',
  ]),
  cancelReason: z.string().max(300).optional(),
});

export const rescheduleSchema = z.object({
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'New date must be formatted as YYYY-MM-DD'),
  newTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'New time must be in HH:mm format'),
  appointmentTypeId: z.string().optional(),
});

export const manualBookingSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().optional(),
  appointmentTypeId: z.string().optional(),
  duration: z.number().min(5).optional(),
  buffer: z.number().min(0).optional(),
  fee: z.number().min(0).optional(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  bookingSource: z.enum(['WALK_IN', 'PHONE', 'WHATSAPP', 'MANUAL']).optional().default('WALK_IN'),
  markAsArrived: z.boolean().optional().default(false),
});

export const updateAppointmentNotesSchema = z.object({
  notes: z.string().max(2000, 'Notes cannot exceed 2000 characters'),
});

export const createAppointmentTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().max(500).optional().default(''),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').default(30),
  bufferTime: z.number().min(0).nullable().optional(),
  fee: z.number().min(0, 'Fee must be 0 or positive').default(500),
  onlineAvailable: z.boolean().default(true),
  offlineAvailable: z.boolean().default(true),
  enabled: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});
