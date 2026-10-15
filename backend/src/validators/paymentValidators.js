import { z } from 'zod';

export const createOrderSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  gatewayProvider: z.enum(['CASHFREE']).optional().default('CASHFREE'),
  paymentMode: z.enum(['ONLINE', 'PAY_AT_CLINIC', 'FREE']).optional().default('ONLINE'),
});

export const verifyPaymentSchema = z.object({
  paymentId: z.string().optional(),
  orderId: z.string().optional(),
  gatewayOrderId: z.string().optional(),
  cashfreeOrderId: z.string().optional(),
  gatewayPaymentId: z.string().optional(),
  gatewaySignature: z.string().optional(),
  paymentMethod: z.enum(['CASHFREE', 'CASHFREE_DEMO', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'FREE']).optional().default('CASHFREE'),
  simulateFailure: z.boolean().optional().default(false),
  notes: z.string().max(500).optional(),
});

export const recordManualPaymentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0').optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NETBANKING']).default('CASH'),
  notes: z.string().max(500).optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().min(1, 'Refund amount must be positive').optional(),
  reason: z.string().min(3, 'Please provide a reason for refund').max(500),
});
