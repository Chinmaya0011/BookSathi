'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Ban,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { blockedDateService } from '@/services/availability.service';
import { formatDisplayDate, format12Hour } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

export default function BlockedDatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New blocked date form
  const [date, setDate] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'PROFESSIONAL') {
      router.replace('/dashboard');
      return;
    }
    if (user?.role === 'PROFESSIONAL') {
      loadBlockedDates();
    }
  }, [user, authLoading, router]);

  const loadBlockedDates = async () => {
    setLoading(true);
    try {
      const res = await blockedDateService.getBlockedDates();
      setBlockedDates(res.data || []);
    } catch (e) {
      console.error('Error fetching blocked dates:', e);
      toast.error('Failed to load blocked dates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!date) {
      toast.warning('Please select a date');
      return;
    }

    setSubmitting(true);
    try {
      await blockedDateService.createBlockedDate({
        date,
        allDay,
        startTime: allDay ? null : startTime,
        endTime: allDay ? null : endTime,
        reason,
      });
      toast.success('Blocked date saved successfully');
      setModalOpen(false);
      setDate('');
      setReason('');
      loadBlockedDates();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add blocked date');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    toast('Unblock this date/time?', {
      description: 'This will restore public booking availability for this slot.',
      action: {
        label: 'Unblock',
        onClick: async () => {
          try {
            await blockedDateService.deleteBlockedDate(id);
            toast.success('Date unblocked successfully');
            loadBlockedDates();
          } catch (e) {
            toast.error('Failed to remove blocked date');
          }
        },
      },
      cancel: {
        label: 'Cancel',
      },
    });
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Blocked Dates & Holidays
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Block specific days or time ranges for festivals, vacations, or personal leaves.
          </p>
        </div>

        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Block a Date / Time
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs">Loading blocked dates...</p>
          </div>
        ) : blockedDates.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {blockedDates.map((item) => (
              <div
                key={item._id}
                className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Ban className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {formatDisplayDate(item.date)}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.allDay
                        ? 'Full Day Blocked'
                        : `${format12Hour(item.startTime)} - ${format12Hour(item.endTime)}`}
                      {item.reason && ` • ${item.reason}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Remove block"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No dates blocked</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your standard weekly availability will apply without any date exceptions.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Block a Specific Date or Time"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Select Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-800">Block entire day</span>
            </label>

            {!allDay && (
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          <Input
            label="Reason (Optional)"
            placeholder="e.g. Diwali Holiday, Medical conference, Personal leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Block Date
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
