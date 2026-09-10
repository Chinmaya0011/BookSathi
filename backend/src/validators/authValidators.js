import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phone: z.string().optional().default(''),
  role: z.enum(['USER', 'PROFESSIONAL', 'ADMIN']).optional().default('USER'),
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
  ]).optional().default('Doctor'),
  specialization: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  timezone: z.string().optional().default('Asia/Kolkata'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
