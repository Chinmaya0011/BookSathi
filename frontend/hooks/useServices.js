'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { appointmentTypeService } from '@/services/appointmentType.service';

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentTypeService.getAppointmentTypes();
      if (res.data?.appointmentTypes) {
        setServices(res.data.appointmentTypes);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load consultation services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const saveService = async (serviceData) => {
    setSaving(true);
    try {
      if (editingService?._id) {
        await appointmentTypeService.updateAppointmentType(editingService._id, serviceData);
        toast.success('Consultation service updated');
      } else {
        await appointmentTypeService.createAppointmentType(serviceData);
        toast.success('Consultation service added');
      }
      setModalOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this consultation service?')) return;
    try {
      await appointmentTypeService.deleteAppointmentType(id);
      toast.success('Consultation service removed');
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete service');
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setModalOpen(true);
  };

  return {
    services,
    loading,
    saving,
    modalOpen,
    setModalOpen,
    editingService,
    fetchServices,
    saveService,
    deleteService,
    openCreateModal,
    openEditModal,
  };
}
