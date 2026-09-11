import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount into Indian Rupee style (₹500, ₹1,500, ₹10,000)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format 24-hour time string into 12-hour AM/PM
 */
export function format12Hour(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Format Indian date with day of week (e.g. "Thu, 12 Sep" or "Thu, 12 Sep 2026")
 */
export function formatDisplayDate(dateInput, includeYear = false) {
  if (!dateInput) return '';
  // If string in YYYY-MM-DD, parse year, month, day to avoid timezone drift
  let date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const [y, m, d] = dateInput.split('T')[0].split('-').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(dateInput);
  }
  if (isNaN(date.getTime())) return String(dateInput);

  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  };
  return date.toLocaleDateString('en-IN', options);
}

/**
 * Format relative time created (e.g., "Booked 12 min ago", "Booked 2 hours ago")
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Booked just now';
  if (diffMin === 1) return 'Booked 1 min ago';
  if (diffMin < 60) return `Booked ${diffMin} min ago`;
  if (diffHour === 1) return 'Booked 1 hour ago';
  if (diffHour < 24) return `Booked ${diffHour} hours ago`;
  if (diffDay === 1) return 'Booked yesterday';
  return `Booked ${diffDay} days ago`;
}

/**
 * Format time until upcoming appointment (e.g., "in 3 hours", "in 45 mins", "in 2 days")
 */
export function formatTimeUntil(dateInput, time24) {
  if (!dateInput || !time24) return '';
  let datePart = dateInput;
  if (typeof dateInput === 'string') {
    datePart = dateInput.split('T')[0];
  } else if (dateInput instanceof Date) {
    datePart = dateInput.toISOString().split('T')[0];
  }
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, min] = time24.split(':').map(Number);
  const apptTime = new Date(year, month - 1, day, hour, min);
  const now = new Date();

  const diffMs = apptTime.getTime() - now.getTime();
  if (diffMs < 0) {
    return 'Happening today / past';
  }
  const diffMin = Math.round(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'in moments';
  if (diffMin < 60) return `in ${diffMin} min${diffMin > 1 ? 's' : ''}`;
  if (diffHour < 24) {
    const remainMin = diffMin % 60;
    if (remainMin === 0) return `in ${diffHour} hour${diffHour > 1 ? 's' : ''}`;
    return `in ${diffHour}h ${remainMin}m`;
  }
  if (diffDay === 1) return 'tomorrow';
  return `in ${diffDay} days`;
}

export function formatFullDateIST(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get date string in YYYY-MM-DD format respecting practitioner timezone
 */
export function formatDateYYYYMMDD(dateInput = new Date(), timezone = 'Asia/Kolkata') {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  } catch {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
