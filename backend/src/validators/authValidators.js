import { z } from 'zod';
import { CANONICAL_PROFESSIONS, normalizeProfession } from '../utils/professionHelpers.js';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phone: z.string().optional().default(''),
  role: z.enum(['USER', 'PROFESSIONAL', 'ADMIN']).optional().default('USER'),
  profession: z
    .preprocess(
      (val) => (typeof val === 'string' ? normalizeProfession(val) : val),
      z.enum(CANONICAL_PROFESSIONS)
    )
    .optional()
    .default('Doctor'),
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
