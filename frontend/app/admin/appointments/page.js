'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ShieldAlert,
  Edit,
  X,
  User,
  Filter,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { formatINR, formatDisplayDate, format12Hour } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status Override Modal State
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('CONFIRMED');
  const [overrideReason, setOverrideReason] = useState('');
  const [submittingOverride, setSubmittingOverride] = useState(false);
  const [overrideError, setOverrideError] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, dateFilter, page]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getAppointments({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        page,
        limit: 15,
      });

      setAppointments(res.data?.appointments || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadAppointments();
  };

  const openOverrideModal = (appt) => {
    setSelectedAppointment(appt);
    setOverrideStatus(appt.status);
    setOverrideReason(appt.cancelReason || '');
    setOverrideError('');
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setSubmittingOverride(true);
    setOverrideError('');
    try {
      await adminService.updateAppointmentStatus(selectedAppointment._id, {
        status: overrideStatus,
        cancelReason: overrideReason.trim() || undefined,
      });
      setSelectedAppointment(null);
      showToast(`Appointment status updated to ${overrideStatus}`);
      loadAppointments();
    } catch (err) {
      setOverrideError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmittingOverride(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            Completed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Global Appointments Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System-wide appointment tracking, emergency cancellations, and status overrides.
          </p>
        </div>

        <Button
          onClick={loadAppointments}
          variant="outline"
          className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-bold"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code, patient name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RotateCcw className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-xs font-semibold">Loading global appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No appointments found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or date selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Appointment Code</th>
                  <th className="px-6 py-4">Patient / Customer</th>
                  <th className="px-6 py-4">Assigned Doctor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-indigo-400 bg-indigo-950/40 px-2 py-1 rounded-lg border border-indigo-800/60">
                        {a.appointmentCode}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">{a.appointmentTypeName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{a.customerName}</div>
                      <div className="text-[11px] text-slate-400">{a.customerPhone}</div>
                      {a.customerEmail && (
                        <div className="text-[10px] text-slate-500">{a.customerEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {a.professionalId ? (
                        <>
                          <div className="font-bold text-white">{a.professionalId.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            /book/{a.professionalId.bookingSlug}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">
                        {formatDisplayDate(a.dateString)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {format12Hour(a.startTime)} - {format12Hour(a.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(a.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        onClick={() => openOverrideModal(a)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-slate-800 p-2 rounded-xl text-xs font-bold"
                        title="Override Status"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Override
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3 py-1.5 border-slate-800 text-slate-300"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-1.5 border-slate-800 text-slate-300"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Status Override Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Override Appointment Status</h3>
                <p className="text-[11px] font-mono text-indigo-400">{selectedAppointment.appointmentCode}</p>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {overrideError && (
              <div className="mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs font-semibold text-rose-300">
                {overrideError}
              </div>
            )}

            <form onSubmit={handleSaveOverride} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Change Status To</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED (Emergency)</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              {overrideStatus === 'CANCELLED' && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Cancellation Reason (Logged)</label>
                  <textarea
                    rows="3"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Administrative override / Clinic emergency"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none resize-none"
                    required
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedAppointment(null)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingOverride}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  {submittingOverride ? 'Updating...' : 'Confirm Override'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
