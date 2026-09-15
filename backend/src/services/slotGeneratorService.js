import { Availability } from '../models/Availability.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { Appointment } from '../models/Appointment.js';
import {
  fromIst,
  toIstParts,
  nowIst,
  timeToMinutes,
  minutesToTime,
  format12Hour,
  getDateString,
  getCurrentTimeString,
  doIntervalsOverlap,
  APP_TZ,
} from '../utils/dateHelpers.js';

// In-memory TTL cache for high-throughput slot querying
const slotCache = new Map();
const monthlyCache = new Map();

const SLOT_CACHE_TTL_MS = 30 * 1000; // 30 seconds
const MONTHLY_CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Periodic garbage collection for expired cache entries
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of slotCache.entries()) {
    if (v.expiresAt <= now) slotCache.delete(k);
  }
  for (const [k, v] of monthlyCache.entries()) {
    if (v.expiresAt <= now) monthlyCache.delete(k);
  }
}, 60 * 1000);

/**
 * Invalidate slot cache when appointments, holds, or blocked dates change
 */
export const invalidateSlotCache = (professionalId, dateString = null) => {
  if (!professionalId) return;
  const pId = String(professionalId);
  for (const [k] of slotCache.keys()) {
    if (k.startsWith(`slots:${pId}`)) {
      if (!dateString || k.includes(`:${dateString}:`)) {
        slotCache.delete(k);
      }
    }
  }
  for (const [k] of monthlyCache.keys()) {
    if (k.startsWith(`monthly:${pId}`)) {
      monthlyCache.delete(k);
    }
  }
};

/**
 * Generate all available booking slots for a professional on a given date (YYYY-MM-DD)
 */
export const getAvailableSlots = async (
  profile,
  targetDateString,
  requestedDuration = null,
  requestedBuffer = null
) => {
  const duration = requestedDuration || profile.bookingSettings?.appointmentDuration || 30;
  const buffer = requestedBuffer !== null && requestedBuffer !== undefined
    ? requestedBuffer
    : (profile.bookingSettings?.bufferTime ?? 10);

  const cacheKey = `slots:${profile._id}:${targetDateString}:${duration}:${buffer}`;
  const cached = slotCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const istNow = nowIst();
  const todayString = istNow.dateString;

  // Parse target date and calculate day of week
  const [year, month, day] = targetDateString.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay(); // 0 for Sunday, 1 for Monday, etc.

  // 1. Check Date Range Bounds
  const maxDays = profile.bookingSettings?.maxAdvanceDays || 60;
  const minNoticeMinutes = profile.bookingSettings?.minNoticeMinutes ?? 0;
  const allowSameDay = profile.bookingSettings?.allowSameDayBooking !== false;

  if (targetDateString < todayString) {
    return { date: targetDateString, slots: [], message: 'Past dates are not available' };
  }

  if (targetDateString === todayString && !allowSameDay) {
    return { date: targetDateString, slots: [], message: 'Same-day appointments are not accepted by this professional' };
  }

  // Check max advance limit
  const todayDate = new Date(todayString + 'T00:00:00Z');
  const diffDays = Math.floor((targetDate - todayDate) / (1000 * 60 * 60 * 24));
  if (diffDays > maxDays) {
    return {
      date: targetDateString,
      slots: [],
      message: `Bookings only open up to ${maxDays} days in advance`,
    };
  }

  // 2. Check if Full Day or Partial Day is Blocked (Optimized covered lean query)
  const blockedDates = await BlockedDate.find({
    professionalId: profile._id,
    date: targetDateString,
  })
    .select('date allDay startTime endTime reason')
    .lean();

  const fullDayBlocked = blockedDates.find((b) => b.allDay);
  if (fullDayBlocked) {
    const resData = {
      date: targetDateString,
      isBlocked: true,
      reason: fullDayBlocked.reason || 'Professional is unavailable on this date',
      slots: [],
    };
    slotCache.set(cacheKey, { expiresAt: Date.now() + SLOT_CACHE_TTL_MS, data: resData });
    return resData;
  }

  // 3. Fetch Weekly Availability (Optimized covered lean query)
  let dayAvailability = await Availability.findOne({
    professionalId: profile._id,
    dayOfWeek,
  })
    .select('dayOfWeek enabled timeRanges')
    .lean();

  // If professional hasn't saved custom availability yet, default to Mon-Sat 09:00-17:00 (Sunday closed)
  if (!dayAvailability) {
    const totalAvailabilityDocs = await Availability.countDocuments({ professionalId: profile._id });
    if (totalAvailabilityDocs === 0 && dayOfWeek !== 0) {
      dayAvailability = {
        enabled: true,
        timeRanges: [{ startTime: '09:00', endTime: '17:00' }],
      };
    }
  }

  if (!dayAvailability || !dayAvailability.enabled || !dayAvailability.timeRanges?.length) {
    const resData = {
      date: targetDateString,
      isClosed: true,
      message: 'Closed on this day',
      slots: [],
    };
    slotCache.set(cacheKey, { expiresAt: Date.now() + SLOT_CACHE_TTL_MS, data: resData });
    return resData;
  }

  // 4. Fetch Existing Active Appointments & Active Non-Expired Holds for this date
  const now = new Date();
  const existingAppointments = await Appointment.find({
    professionalId: profile._id,
    dateString: targetDateString,
    $or: [
      {
        status: {
          $in: ['BOOKED', 'DONE', 'CONFIRMED', 'PENDING', 'COMPLETED', 'IN_PROGRESS'],
        },
      },
      {
        status: { $in: ['HOLD', 'HELD'] },
        holdExpiresAt: { $gt: now },
      },
    ],
  })
    .select('startTime endTime startMinutes endMinutes duration buffer status holdExpiresAt')
    .lean();

  // Map booked time intervals in minutes, factoring in their scheduled duration + individual buffer
  const bookedIntervals = existingAppointments.map((appt) => {
    const apptStart = appt.startMinutes !== undefined && appt.startMinutes !== null
      ? appt.startMinutes
      : timeToMinutes(appt.startTime);
    const apptEnd = appt.endMinutes !== undefined && appt.endMinutes !== null
      ? appt.endMinutes
      : timeToMinutes(appt.endTime);
    const apptBuffer = appt.buffer || 0;
    return {
      start: apptStart,
      end: apptEnd,
      endWithBuffer: apptEnd + apptBuffer,
      status: appt.status,
    };
  });

  // Map partial blocked intervals in minutes
  const partialBlockedIntervals = blockedDates
    .filter((b) => !b.allDay && b.startTime && b.endTime)
    .map((b) => ({
      start: timeToMinutes(b.startTime),
      end: timeToMinutes(b.endTime),
      reason: b.reason || 'Blocked',
    }));

  // 5. Generate Candidate Slots Across Available Time Ranges
  const candidateSlots = [];

  for (const range of dayAvailability.timeRanges) {
    const rangeStartMinutes = timeToMinutes(range.startTime);
    const rangeEndMinutes = timeToMinutes(range.endTime);

    let currentSlotStart = rangeStartMinutes;

    while (currentSlotStart + duration <= rangeEndMinutes) {
      const currentSlotEnd = currentSlotStart + duration;
      const currentSlotEndWithBuffer = currentSlotEnd + buffer;
      const startTimeStr = minutesToTime(currentSlotStart);
      const endTimeStr = minutesToTime(currentSlotEnd);

      const slotStartAt = fromIst(targetDateString, currentSlotStart);
      const slotEndAt = fromIst(targetDateString, currentSlotEnd);
      const nowMs = Date.now();
      const minNoticeMs = minNoticeMinutes * 60 * 1000;

      // Check minimum notice & past slot using exact UTC timestamp vs now
      let isPastNotice = false;
      if (slotStartAt.getTime() < nowMs + minNoticeMs) {
        isPastNotice = true;
      }

      // Check collision with partial blocked time ranges
      const isBlockedTime = partialBlockedIntervals.some((b) =>
        doIntervalsOverlap(currentSlotStart, currentSlotEnd, b.start, b.end)
      );

      // Check collision with existing booked appointments / holds:
      // Candidate slot [currentSlotStart, currentSlotEndWithBuffer] must not overlap
      // with any booked appointment [appt.start, appt.endWithBuffer]
      const overlappingBooked = bookedIntervals.find((b) => {
        // Direct consultation collision
        if (doIntervalsOverlap(currentSlotStart, currentSlotEnd, b.start, b.end)) {
          return true;
        }
        // Collision with prior appointment's buffer
        if (currentSlotStart < b.endWithBuffer && currentSlotEnd > b.start) {
          return true;
        }
        // Collision with candidate slot's buffer extending into next appointment
        if (currentSlotStart < b.start && currentSlotEndWithBuffer > b.start) {
          return true;
        }
        return false;
      });

      let isAvailable = true;
      let slotStatus = 'AVAILABLE';
      let statusLabel = 'Available';

      if (overlappingBooked) {
        isAvailable = false;
        if (overlappingBooked.status === 'HELD') {
          slotStatus = 'HELD';
          statusLabel = 'Reserved';
        } else {
          slotStatus = 'BOOKED';
          statusLabel = 'Booked';
        }
      } else if (isBlockedTime) {
        isAvailable = false;
        slotStatus = 'BLOCKED';
        statusLabel = 'Unavailable';
      } else if (isPastNotice) {
        isAvailable = false;
        slotStatus = 'PAST';
        statusLabel = 'Past';
      }

      candidateSlots.push({
        time: startTimeStr,
        time12: format12Hour(startTimeStr),
        endTime: endTimeStr,
        endTime12: format12Hour(endTimeStr),
        startMinutes: currentSlotStart,
        endMinutes: currentSlotEnd,
        startAt: slotStartAt,
        endAt: slotEndAt,
        duration,
        buffer,
        available: isAvailable,
        status: slotStatus,
        statusLabel,
      });

      // Dynamic slot interval step: move forward by duration + buffer
      currentSlotStart = currentSlotEnd + buffer;
    }
  }

  const resultData = {
    date: targetDateString,
    timezone: APP_TZ,
    duration,
    buffer,
    totalAvailable: candidateSlots.filter((s) => s.available).length,
    slots: candidateSlots,
  };

  slotCache.set(cacheKey, { expiresAt: Date.now() + SLOT_CACHE_TTL_MS, data: resultData });
  return resultData;
};

/**
 * Get monthly availability overview (days that have open slots / closed status)
 */
export const getMonthlyAvailabilityOverview = async (profile, year, month) => {
  const cacheKey = `monthly:${profile._id}:${year}:${month}`;
  const cached = monthlyCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const istNow = nowIst();
  const todayString = istNow.dateString;
  const daysInMonth = new Date(year, month, 0).getDate();

  const availability = await Availability.find({ professionalId: profile._id })
    .select('dayOfWeek enabled timeRanges')
    .lean();
  const hasCustomAvailability = availability.length > 0;
  const availabilityMap = new Map(availability.map((a) => [a.dayOfWeek, a]));

  const blockedList = await BlockedDate.find({
    professionalId: profile._id,
    date: {
      $gte: `${year}-${String(month).padStart(2, '0')}-01`,
      $lte: `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`,
    },
  })
    .select('date allDay reason')
    .lean();
  const blockedMap = new Map(blockedList.map((b) => [b.date, b]));

  const daysOverview = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(Date.UTC(year, month - 1, d));
    const dayOfWeek = dateObj.getUTCDay();

    const isPast = dateStr < todayString;
    const isBlocked = blockedMap.has(dateStr) && blockedMap.get(dateStr).allDay;
    
    let dayConfig = availabilityMap.get(dayOfWeek);
    if (!hasCustomAvailability && !dayConfig) {
      if (dayOfWeek !== 0) {
        dayConfig = { enabled: true, timeRanges: [{ startTime: '09:00', endTime: '17:00' }] };
      }
    }

    const isClosed = !dayConfig || !dayConfig.enabled || !dayConfig.timeRanges?.length;

    daysOverview.push({
      date: dateStr,
      day: d,
      dayOfWeek,
      isAvailable: !isPast && !isBlocked && !isClosed,
      isPast,
      isBlocked,
      isClosed,
      reason: blockedMap.get(dateStr)?.reason || (isClosed ? 'Closed' : ''),
    });
  }

  monthlyCache.set(cacheKey, { expiresAt: Date.now() + MONTHLY_CACHE_TTL_MS, data: daysOverview });
  return daysOverview;
};

