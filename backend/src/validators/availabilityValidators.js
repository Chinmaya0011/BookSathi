import { z } from 'zod';

const timeRangeSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'),
}).passthrough().refine((data) => data.startTime < data.endTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const dayAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  enabled: z.boolean(),
  timeRanges: z.array(timeRangeSchema).optional().default([]),
}).passthrough();

export const updateWeeklyAvailabilitySchema = z.object({
  availability: z.array(dayAvailabilitySchema).min(1),
}).passthrough();

export const createBlockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  allDay: z.boolean().default(true),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  reason: z.string().max(200).optional().default(''),
});
