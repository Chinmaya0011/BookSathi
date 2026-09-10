'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { availabilityService } from '@/services/availability.service';

export function useAvailability() {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const res = await availabilityService.getWeeklyAvailability();
      if (res.data?.availability) {
        setAvailability(res.data.availability);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load availability');
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
            timeRanges: nextEnabled && (!day.timeRanges || day.timeRanges.length === 0)
              ? [{ startTime: '09:00', endTime: '17:00' }]
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
          const newStart = lastRange ? lastRange.endTime : '09:00';
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
    toast.success('Copied Monday schedule to Tuesday - Saturday');
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
