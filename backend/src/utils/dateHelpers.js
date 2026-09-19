export const APP_TZ = 'Asia/Kolkata';

/**
 * Convert IST calendar date (YYYY-MM-DD) and time (HH:mm string or integer minutes 0-1440) to exact UTC Date.
 * Handles exact timezone offset for Asia/Kolkata (+05:30) across midnight boundaries.
 */
export const fromIst = (dateString, hhmm) => {
  if (!dateString || hhmm === undefined || hhmm === null) return null;
  const [year, month, day] = dateString.split('-').map(Number);

  let hours = 0;
  let minutes = 0;
  if (typeof hhmm === 'number') {
    hours = Math.floor(hhmm / 60);
    minutes = hhmm % 60;
  } else if (typeof hhmm === 'string' && hhmm.includes(':')) {
    const parts = hhmm.split(':').map(Number);
    hours = parts[0];
    minutes = parts[1];
  } else {
    return null;
  }

  const pad = (n) => String(n).padStart(2, '0');
  // Asia/Kolkata is fixed UTC+05:30 (no daylight saving time shifts)
  const isoStr = `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00+05:30`;
  return new Date(isoStr);
};

/**
 * Convert UTC Date (or timestamp) to IST calendar parts:
 * returns { dateString, hhmm, startMinutes, hours, minutes, date }
 */
export const toIstParts = (date = new Date()) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const dateStrFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateString = dateStrFormatter.format(d); // YYYY-MM-DD

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const hhmm = timeFormatter.format(d); // HH:mm
  const [hours, minutes] = hhmm.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;

  return {
    dateString,
    hhmm,
    startMinutes,
    hours,
    minutes,
    date: d,
  };
};

/**
 * Get current moment in IST with calendar date and minute parts
 */
export const nowIst = () => {
  const now = new Date();
  const parts = toIstParts(now);
  return {
    ...parts,
    currentMinutes: parts.startMinutes,
    timestamp: now.getTime(),
  };
};

/**
 * Helper to convert HH:mm string to total minutes from midnight
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Helper to convert minutes from midnight to HH:mm string
 */
export const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Format HH:mm into 12-hour AM/PM string (e.g., 09:30 -> 09:30 AM, 14:00 -> 02:00 PM)
 */
export const format12Hour = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

/**
 * Get date string in YYYY-MM-DD format based on a given timezone
 */
export const getDateString = (date = new Date(), timezone = APP_TZ) => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d); // Returns YYYY-MM-DD
};

/**
 * Get current time in HH:mm based on a given timezone
 */
export const getCurrentTimeString = (timezone = APP_TZ) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(new Date());
};

/**
 * Format date to Indian standard DD/MM/YYYY
 */
export const formatIndianDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Check if two time intervals overlap (including end boundary logic)
 */
export const doIntervalsOverlap = (startA, endA, startB, endB) => {
  return startA < endB && endA > startB;
};

/**
 * Determine customer arrival status relative to scheduled appointment time
 */
export const evaluateArrivalStatus = ({
  scheduledStartTime, // HH:mm
  arrivalMinutes, // minutes from midnight (or current time if omitted)
  earlyArrivalMinutes = 15,
  lateGraceMinutes = 10,
  noShowThresholdMinutes = 15,
}) => {
  const scheduledMinutes = timeToMinutes(scheduledStartTime);
  const diff = arrivalMinutes - scheduledMinutes; // negative = early, positive = late

  if (diff < -earlyArrivalMinutes) {
    return {
      status: 'ARRIVED_VERY_EARLY',
      minutesDiff: Math.abs(diff),
      label: `Arrived early by ${Math.abs(diff)} minutes`,
      isLate: false,
      isNoShowRisk: false,
    };
  }
  if (diff < 0) {
    return {
      status: 'ARRIVED_EARLY',
      minutesDiff: Math.abs(diff),
      label: `Arrived early by ${Math.abs(diff)} minutes`,
      isLate: false,
      isNoShowRisk: false,
    };
  }
  if (diff <= lateGraceMinutes) {
    return {
      status: 'ON_TIME',
      minutesDiff: diff,
      label: diff === 0 ? 'On time' : `Within grace period (+${diff}m)`,
      isLate: false,
      isNoShowRisk: false,
    };
  }
  if (diff <= noShowThresholdMinutes) {
    return {
      status: 'LATE',
      minutesDiff: diff,
      label: `Late by ${diff} minutes`,
      isLate: true,
      isNoShowRisk: false,
    };
  }
  return {
    status: 'VERY_LATE',
    minutesDiff: diff,
    label: `Late by ${diff} minutes (Exceeded no-show threshold)`,
    isLate: true,
    isNoShowRisk: true,
  };
};

/**
 * Generate human readable unique booking appointment code (BS-XXXXXX)
 */
export const generateAppointmentCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BS-${code}`;
};

/**
 * Convert dateString (YYYY-MM-DD) and minutesFromMidnight (0-1440) in Asia/Kolkata timezone to UTC Date
 */
export const createUtcDateFromLocal = (dateString, minutesFromMidnight) => {
  return fromIst(dateString, minutesFromMidnight);
};


