'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { availabilityService } from '@/services/availability.service';

export const DEFAULT_WEEKLY_SCHEDULE = [
  { dayOfWeek: 1, enabled: true, timeRanges: [{ startTime: '09:00', endTime: '18:00' }] }, // Monday
  { dayOfWeek: 2, enabled: true, timeRanges: [{ startTime: '09:00', endTime: '18:00' }] }, // Tuesday
  { dayOfWeek: 3, enabled: true, timeRanges: [{ startTime: '09:00', endTime: '18:00' }] }, // Wednesday
  { dayOfWeek: 4, enabled: true, timeRanges: [{ startTime: '09:00', endTime: '18:00' }] }, // Thursday
  { dayOfWeek: 5, enabled: true, timeRanges: [{ startTime: '09:00', endTime: '18:00' }] }, // Friday
  { dayOfWeek: 6, enabled: true, timeRanges: [{ startTime: '09:00', endTime: '14:00' }] }, // Saturday
  { dayOfWeek: 0, enabled: false, timeRanges: [{ startTime: '09:00', endTime: '14:00' }] }, // Sunday
];

function normalizeSchedule(fetchedList) {
  const map = new Map();
  if (Array.isArray(fetchedList)) {
    fetchedList.forEach((d) => {
      if (typeof d?.dayOfWeek === 'number') {
        map.set(d.dayOfWeek, d);
      }
    });
  }

  // Display Order: Monday through Saturday, then Sunday
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((dow) => {
    const existing = map.get(dow);
    if (existing) {
      return {
        ...existing,
        dayOfWeek: dow,
        enabled: existing.enabled !== false,
        timeRanges:
          Array.isArray(existing.timeRanges) && existing.timeRanges.length > 0
            ? existing.timeRanges
            : [{ startTime: '09:00', endTime: dow === 6 || dow === 0 ? '14:00' : '18:00' }],
      };
    }
    const def = DEFAULT_WEEKLY_SCHEDULE.find((d) => d.dayOfWeek === dow);
    return JSON.parse(JSON.stringify(def));
  });
}

export function useAvailability() {
  const [availability, setAvailability] = useState(() => normalizeSchedule([]));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const res = await availabilityService.getWeeklyAvailability();
      const rawList = res?.data?.availability || res?.data || res || [];
      const normalized = normalizeSchedule(Array.isArray(rawList) ? rawList : []);
      setAvailability(normalized);
    } catch (err) {
      console.warn('Using default availability fallback:', err?.message);
      setAvailability(normalizeSchedule([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const toggleDay = (dayOfWeek) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayOfWeek) {
          const nextEnabled = !day.enabled;
          return {
            ...day,
            enabled: nextEnabled,
            timeRanges:
              nextEnabled && (!day.timeRanges || day.timeRanges.length === 0)
                ? [{ startTime: '09:00', endTime: dayOfWeek === 6 || dayOfWeek === 0 ? '14:00' : '18:00' }]
                : day.timeRanges,
          };
        }
        return day;
      })
    );
    setHasChanges(true);
  };

  const addTimeRange = (dayOfWeek) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayOfWeek) {
          const lastRange = day.timeRanges?.[day.timeRanges.length - 1];
          const newStart = lastRange ? lastRange.endTime : '14:00';
          return {
            ...day,
            timeRanges: [...(day.timeRanges || []), { startTime: newStart, endTime: '18:00' }],
          };
        }
        return day;
      })
    );
    setHasChanges(true);
  };

  const removeTimeRange = (dayOfWeek, index) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayOfWeek) {
          return {
            ...day,
            timeRanges: day.timeRanges.filter((_, i) => i !== index),
          };
        }
        return day;
      })
    );
    setHasChanges(true);
  };

  const updateTimeRange = (dayOfWeek, index, field, value) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayOfWeek) {
          const updatedRanges = day.timeRanges.map((range, i) => {
            if (i === index) {
              return { ...range, [field]: value };
            }
            return range;
          });
          return { ...day, timeRanges: updatedRanges };
        }
        return day;
      })
    );
    setHasChanges(true);
  };

  const copyMondayToAll = () => {
    const monday = availability.find((d) => d.dayOfWeek === 1);
    if (!monday) {
      toast.error('Monday schedule not found');
      return;
    }

    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === 0) return day; // Keep Sunday as is
        return {
          ...day,
          enabled: monday.enabled,
          timeRanges: JSON.parse(JSON.stringify(monday.timeRanges || [])),
        };
      })
    );
    setHasChanges(true);
    toast.success('Copied Monday timings to Tuesday through Saturday!');
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      await availabilityService.updateWeeklyAvailability(availability);
      setHasChanges(false);
      toast.success('Weekly availability schedule saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  return {
    availability,
    loading,
    saving,
    hasChanges,
    toggleDay,
    addTimeRange,
    removeTimeRange,
    updateTimeRange,
    copyMondayToAll,
    saveAvailability,
    fetchAvailability,
  };
}
