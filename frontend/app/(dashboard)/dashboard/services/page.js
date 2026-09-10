'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  Clock,
  IndianRupee,
  RefreshCw,
  Building2,
  Sparkles,
  Layers,
  Power,
  Info,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { appointmentTypeService } from '@/services/appointmentType.service';
import { formatINR, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const QUICK_TEMPLATES = [
  {
    name: 'General Consultation',
    description: 'Standard 1-on-1 direct consultation & assessment.',
    duration: 30,
    fee: 500,
  },
  {
    name: 'Quick Follow-up Visit',
    description: 'Brief review of previous diagnosis, progress check, or follow-up query.',
    duration: 15,
    fee: 300,
  },
  {
    name: 'Comprehensive Evaluation',
    description: 'Detailed analysis, thorough examination, and full discussion.',
    duration: 45,
    fee: 800,
  },
  {
    name: 'Extended Deep-Dive Session',
    description: 'In-depth consultation for complex cases, full review, and advisory.',
    duration: 60,
    fee: 1200,
  },
];

export default function ServicesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  const [form, setForm] = useState({
    name: '',
    description: '',
    duration: 30,
    fee: 500,
    consultationType: 'IN_PERSON',
    enabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'PROFESSIONAL') {
      router.replace('/dashboard');
      return;
    }
    if (user?.role === 'PROFESSIONAL') {
      loadServices();
    }
  }, [user, authLoading, router]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await appointmentTypeService.getAppointmentTypes();
      setServices(res.data || []);
    } catch (e) {
      console.error('Failed to load services:', e);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (preset = null) => {
    setEditingId(null);
    if (preset) {
      setForm({
        name: preset.name,
        description: preset.description,
        duration: preset.duration,
        fee: preset.fee,
        consultationType: 'IN_PERSON',
        enabled: true,
      });
    } else {
      setForm({
        name: '',
        description: '',
        duration: 30,
        fee: 500,
        consultationType: 'IN_PERSON',
        enabled: true,
      });
    }
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingId(service._id);
    setForm({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      fee: service.fee,
      consultationType: service.consultationType || 'IN_PERSON',
      enabled: service.enabled ?? true,
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (service) => {
    const newStatus = !(service.enabled ?? true);
    setTogglingId(service._id);
    try {
      await appointmentTypeService.updateAppointmentType(service._id, {
        enabled: newStatus,
      });
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? { ...s, enabled: newStatus } : s))
      );
      toast.success(
        `"${service.name}" is now ${newStatus ? 'active & open for bookings' : 'paused/hidden'}`
      );
    } catch (e) {
      toast.error('Failed to toggle service status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning('Please enter a service name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        duration: Number(form.duration),
        fee: Number(form.fee),
        consultationType: 'IN_PERSON',
        enabled: Boolean(form.enabled),
        onlineAvailable: false,
        offlineAvailable: true,
      };

      if (editingId) {
        await appointmentTypeService.updateAppointmentType(editingId, payload);
        toast.success('Service updated successfully!');
      } else {
        await appointmentTypeService.createAppointmentType(payload);
        toast.success('New service created successfully!');
      }
      setModalOpen(false);
      loadServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    toast('Delete this consultation service?', {
      description: 'Existing appointments booked under this service will remain intact.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await appointmentTypeService.deleteAppointmentType(id);
            toast.success('Service deleted successfully');
            loadServices();
          } catch (e) {
            toast.error('Failed to delete service');
          }
        },
      },
      cancel: {
        label: 'Cancel',
      },
    });
  };

  // Metrics
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.enabled !== false).length;
    const inactive = total - active;
    const avgFee = total > 0 ? Math.round(services.reduce((acc, s) => acc + (s.fee || 0), 0) / total) : 0;
    return { total, active, inactive, avgFee };
  }, [services]);

  // Filtered List
  const filteredServices = useMemo(() => {
    if (activeTab === 'ACTIVE') {
      return services.filter((s) => s.enabled !== false);
    }
    if (activeTab === 'INACTIVE') {
      return services.filter((s) => s.enabled === false);
    }
    return services;
  }, [services, activeTab]);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            <span>Consultation Services</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your appointment consultation offerings, durations, and fees.
          </p>
        </div>

        <Button size="sm" onClick={() => openCreateModal()}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Service
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">All Services</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          <span className="text-[11px] text-slate-500 font-semibold">{stats.total} total offerings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Services</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Open for client bookings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-indigo-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Fee</span>
            <IndianRupee className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatINR(stats.avgFee)}</p>
          <span className="text-[11px] text-indigo-600 font-semibold">Per consultation</span>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">Quick Setup</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xs text-indigo-950 font-medium">Add pre-configured popular consultation packages in 1 click.</p>
        </div>
      </div>

      {/* Quick Templates Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Popular Templates:</span>
          </span>
          <span className="text-[11px] text-slate-400">Click any card to pre-fill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {QUICK_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => openCreateModal(tmpl)}
              className="text-left p-3 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                  {tmpl.name}
                </span>
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                <span>{tmpl.duration}m</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">{formatINR(tmpl.fee)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Switchable Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Services ({stats.total})</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'ACTIVE'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active ({stats.active})</span>
          </button>

          <button
            onClick={() => setActiveTab('INACTIVE')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'INACTIVE'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            )}
          >
            <span>Paused ({stats.inactive})</span>
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs font-medium">Loading consultation services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredServices.map((s) => {
              const isEnabled = s.enabled !== false;

              return (
                <div
                  key={s._id}
                  className={cn(
                    'p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50/70',
                    !isEnabled && 'opacity-60 bg-slate-50/40'
                  )}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold border bg-indigo-50 border-indigo-200 text-indigo-600">
                      <Briefcase className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{s.name}</h4>

                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                            isEnabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          )}
                        >
                          {isEnabled ? '● Active' : '○ Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mt-1.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" /> {s.duration} mins
                        </span>
                        <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                          {formatINR(s.fee)}
                        </span>
                        {s.description && (
                          <span className="text-slate-500 truncate max-w-sm">{s.description}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    {/* Instant Status Switch */}
                    <button
                      type="button"
                      disabled={togglingId === s._id}
                      onClick={() => handleToggleStatus(s)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                        isEnabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      )}
                      title={isEnabled ? 'Click to deactivate' : 'Click to activate'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(s)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit Service"
                      aria-label={`Edit ${s.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(s._id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Service"
                      aria-label={`Delete ${s.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No services found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your consultation offerings using the button above or 1-click templates.
            </p>
          </div>
        )}
      </div>

      {/* Create / Edit Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Consultation Service' : 'Add Consultation Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="1. Service Title"
            required
            placeholder="e.g. Consultation Visit, General Checkup, Tax Advisory"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="2. Description (Optional)"
            placeholder="Briefly explain what clients will get during this consultation"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Duration Chips */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              3. Consultation Duration (Mins)
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {[15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setForm({ ...form, duration: mins })}
                  className={cn(
                    'py-2 px-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                    form.duration === mins
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
            {![15, 20, 30, 45, 60].includes(form.duration) && (
              <Input
                type="number"
                min="5"
                max="360"
                placeholder="Custom Duration (minutes)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              />
            )}
          </div>

          <Input
            label="4. Consultation Fee (₹ INR)"
            type="number"
            required
            value={form.fee}
            onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
            prefix={<span className="text-xs font-bold text-slate-400">₹</span>}
          />

          {/* Active Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-900">Enable this service for bookings</p>
              <p className="text-[11px] text-slate-500">Clients can see and book this service on your public page.</p>
            </div>
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editingId ? 'Save Changes' : 'Publish Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
