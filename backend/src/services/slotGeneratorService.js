import { Availability } from '../models/Availability.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { Appointment } from '../models/Appointment.js';
import {
  timeToMinutes,
  minutesToTime,
  format12Hour,
  getDateString,
  getCurrentTimeString,
  doIntervalsOverlap,
} from '../utils/dateHelpers.js';

/**
 * Generate all available booking slots for a professional on a given date (YYYY-MM-DD)
 */
export const getAvailableSlots = async (
  profile,
  targetDateString,
  requestedDuration = null,
  requestedBuffer = null
) => {
  const timezone = profile.timezone || 'Asia/Kolkata';
  const todayString = getDateString(new Date(), timezone);
  const currentTimeString = getCurrentTimeString(timezone);
  const currentMinutes = timeToMinutes(currentTimeString);

  // Parse target date and calculate day of week
  const [year, month, day] = targetDateString.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay(); // 0 for Sunday, 1 for Monday, etc.

  // 1. Check Date Range Bounds
  const maxDays = profile.bookingSettings?.maxAdvanceDays || 60;
  const minNoticeMinutes = profile.bookingSettings?.minNoticeMinutes ?? 0;
  const allowSameDay = profile.bookingSettings?.allowSameDayBooking !== false;
  const duration = requestedDuration || profile.bookingSettings?.appointmentDuration || 30;
  const buffer = requestedBuffer !== null && requestedBuffer !== undefined
    ? requestedBuffer
    : (profile.bookingSettings?.bufferTime ?? 10);

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

  // 2. Check if Full Day or Partial Day is Blocked
  const blockedDates = await BlockedDate.find({
    professionalId: profile._id,
    date: targetDateString,
  });

  const fullDayBlocked = blockedDates.find((b) => b.allDay);
  if (fullDayBlocked) {
    return {
      date: targetDateString,
      isBlocked: true,
      reason: fullDayBlocked.reason || 'Professional is unavailable on this date',
      slots: [],
    };
  }

  // 3. Fetch Weekly Availability
  const totalAvailabilityDocs = await Availability.countDocuments({ professionalId: profile._id });
  let dayAvailability = await Availability.findOne({
    professionalId: profile._id,
    dayOfWeek,
  });

  // If professional hasn't saved custom availability yet, default to Mon-Sat 09:00-17:00 (Sunday closed)
  if (totalAvailabilityDocs === 0 && !dayAvailability) {
    if (dayOfWeek !== 0) {
      dayAvailability = {
        enabled: true,
        timeRanges: [{ startTime: '09:00', endTime: '17:00' }],
      };
    }
  }

  if (!dayAvailability || !dayAvailability.enabled || !dayAvailability.timeRanges?.length) {
    return {
      date: targetDateString,
      isClosed: true,
      message: 'Closed on this day',
      slots: [],
    };
  }

  // 4. Fetch Existing Active Appointments & Active Non-Expired Holds for this date
  const now = new Date();
  const existingAppointments = await Appointment.find({
    professionalId: profile._id,
    dateString: targetDateString,
    $or: [
      {
        status: {
          $in: ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS'],
        },
      },
      {
        status: 'HELD',
        holdExpiresAt: { $gt: now },
      },
    ],
  });

  // Map booked time intervals in minutes, factoring in their scheduled duration + individual buffer
  const bookedIntervals = existingAppointments.map((appt) => {
    const apptStart = timeToMinutes(appt.startTime);
    const apptEnd = timeToMinutes(appt.endTime);
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

      // Check minimum notice if target date is today
      let isPastNotice = false;
      if (targetDateString === todayString) {
        if (currentSlotStart < currentMinutes + minNoticeMinutes) {
          isPastNotice = true;
        }
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

  return {
    date: targetDateString,
    timezone,
    duration,
    buffer,
    totalAvailable: candidateSlots.filter((s) => s.available).length,
    slots: candidateSlots,
  };
};

/**
 * Get monthly availability overview (days that have open slots / closed status)
 */
export const getMonthlyAvailabilityOverview = async (profile, year, month) => {
  const timezone = profile.timezone || 'Asia/Kolkata';
  const todayString = getDateString(new Date(), timezone);
  const daysInMonth = new Date(year, month, 0).getDate();

  const availability = await Availability.find({ professionalId: profile._id });
  const hasCustomAvailability = availability.length > 0;
  const availabilityMap = new Map(availability.map((a) => [a.dayOfWeek, a]));

  const blockedList = await BlockedDate.find({
    professionalId: profile._id,
    date: {
      $gte: `${year}-${String(month).padStart(2, '0')}-01`,
      $lte: `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`,
    },
  });
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

  return daysOverview;
};

