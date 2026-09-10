'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  IndianRupee,
  Receipt,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Calendar,
  Sparkles,
  ExternalLink,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { userAppointmentService } from '@/services/userAppointment.service';
import { formatINR, formatDisplayDate, format12Hour, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function UserPaymentsView({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await userAppointmentService.getMyAppointments({ limit: 100 });
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      console.error('Failed to load customer payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (appt) => {
    if (appt.paymentStatus) return appt.paymentStatus;
    if (appt.status === 'COMPLETED' || appt.status === 'CONFIRMED') return 'PAID';
    if (appt.status === 'CANCELLED') return 'REFUNDED';
    return 'PENDING';
  };

  const filteredAppointments = appointments.filter((a) => {
    const status = getPaymentStatus(a);
    if (filter === 'PAID' && status !== 'PAID') return false;
    if (filter === 'PENDING' && status !== 'PENDING') return false;
    if (filter === 'REFUNDED' && status !== 'REFUNDED') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const proName = (a.professionalId?.name || '').toLowerCase();
      const service = (a.appointmentTypeName || '').toLowerCase();
      const code = (a.appointmentCode || '').toLowerCase();
      return proName.includes(q) || service.includes(q) || code.includes(q);
    }
    return true;
  });

  // Calculate user payment metrics
  const totalSpent = appointments
    .filter((a) => ['PAID', 'SUCCESS'].includes(getPaymentStatus(a)))
    .reduce((sum, a) => sum + (Number(a.fee) || 0), 0);

  const paidCount = appointments.filter((a) => getPaymentStatus(a) === 'PAID').length;
  const pendingCount = appointments.filter((a) => getPaymentStatus(a) === 'PENDING').length;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full animate-in fade-in duration-300 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Invoices & Billing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Payments & Receipts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              View your consultation invoices, track payment status, and download tax receipts for past bookings.
            </p>
          </div>

          <button
            onClick={loadAppointments}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-white shadow-md transition-colors cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-black">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{formatINR(totalSpent)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Invoices</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{paidCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Receipts</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{appointments.length}</p>
          </div>
        </div>
      </div>

      {/* Filter & Transactions Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'PAID', label: 'Paid & Completed' },
              { id: 'PENDING', label: 'Pending Payment' },
              { id: 'REFUNDED', label: 'Cancelled / Refunded' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filter === t.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor, service, or code..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs font-semibold">Loading invoices & payment history...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No payment receipts found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
              When you book appointments and complete consultations, your itemized receipts will appear here.
            </p>
            <Link
              href="/dashboard/find"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Browse Verified Professionals</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Booking / Code</th>
                    <th className="px-6 py-3.5">Professional & Service</th>
                    <th className="px-6 py-3.5">Consultation Date</th>
                    <th className="px-6 py-3.5">Amount Paid</th>
                    <th className="px-6 py-3.5">Payment Status</th>
                    <th className="px-6 py-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredAppointments.map((appt) => {
                    const status = getPaymentStatus(appt);
                    const pro = appt.professionalId || {};

                    return (
                      <tr key={appt._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-slate-900">
                            #{appt.appointmentCode}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {appt.bookingSource || 'ONLINE'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{pro.name || 'Professional'}</div>
                          <div className="text-[11px] text-indigo-600 font-semibold">
                            {appt.appointmentTypeName || 'Consultation'}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {formatDisplayDate(appt.dateString)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {format12Hour(appt.startTime)} - {format12Hour(appt.endTime)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-900 text-sm">
                            {formatINR(appt.fee)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {status === 'PAID' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Paid
                            </span>
                          )}
                          {status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                          {status === 'REFUNDED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <RotateCcw className="w-3 h-3" />
                              Cancelled / Refunded
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReceipt(appt)}
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-bold py-1.5 px-3 rounded-xl"
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1" /> View Receipt
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredAppointments.map((appt) => {
                const status = getPaymentStatus(appt);
                const pro = appt.professionalId || {};

                return (
                  <div key={appt._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        #{appt.appointmentCode}
                      </span>
                      {status === 'PAID' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      )}
                      {status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {status === 'REFUNDED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Refunded
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{pro.name || 'Professional'}</h4>
                        <p className="text-xs text-indigo-600 font-semibold">{appt.appointmentTypeName || 'Consultation'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDisplayDate(appt.dateString)} • {format12Hour(appt.startTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block">{formatINR(appt.fee)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(appt)}
                        className="w-full text-indigo-600 border-indigo-200 text-xs font-bold py-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5 mr-1" /> View Receipt
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Itemized Consultation Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 space-y-6">
            {/* Receipt Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Consultation Receipt</h3>
                  <p className="text-[10px] font-mono text-slate-400">#{selectedReceipt.appointmentCode}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Content */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">BookSaathi Appointment Slip</h4>
                  <p className="text-[11px] text-slate-500">Official Consultation Billing Token</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {getPaymentStatus(selectedReceipt)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Patient / Client</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.customerName}</span>
                  <p className="text-[11px] text-slate-500">{selectedReceipt.customerPhone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Consultant / Doctor</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.professionalId?.name || 'Professional'}</span>
                  <p className="text-[11px] text-indigo-600 font-semibold">{selectedReceipt.professionalId?.profession || 'Consultant'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.appointmentTypeName || 'Consultation'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-800">{formatDisplayDate(selectedReceipt.dateString)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Slot:</span>
                  <span className="font-bold text-slate-800">{format12Hour(selectedReceipt.startTime)} - {format12Hour(selectedReceipt.endTime)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200 text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-indigo-600">{formatINR(selectedReceipt.fee)}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-slate-700 text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Receipt
              </Button>

              <Button
                size="sm"
                onClick={() => setSelectedReceipt(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
