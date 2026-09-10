'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { appointmentService } from '@/services/appointment.service';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  // Action modals
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 20,
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (selectedDate) params.date = selectedDate;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await appointmentService.getAppointments(params);
      if (res.data) {
        setAppointments(res.data.appointments || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedDate, searchQuery, pagination.page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await appointmentService.updateStatus(id, status);
      toast.success(`Appointment marked as ${status.toLowerCase()}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const rescheduleAppointment = async (id, newDate, newTime) => {
    setActionLoading(true);
    try {
      await appointmentService.reschedule(id, { date: newDate, startTime: newTime });
      toast.success('Appointment rescheduled successfully');
      setRescheduleModalOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAppointment = async (id, reason) => {
    setActionLoading(true);
    try {
      await appointmentService.cancel(id, { reason });
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    appointments,
    loading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    pagination,
    setPagination,
    rescheduleModalOpen,
    setRescheduleModalOpen,
    selectedAppointment,
    setSelectedAppointment,
    actionLoading,
    fetchAppointments,
    updateStatus,
    rescheduleAppointment,
    cancelAppointment,
  };
}
