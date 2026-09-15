'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  IndianRupee,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Receipt,
  Download,
  Plus,
  Printer,
  X,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/payment.service';
import { appointmentService } from '@/services/appointment.service';
import { formatINR, formatDisplayDate, format12Hour, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import UserPaymentsView from '@/components/dashboard/UserPaymentsView';

export default function PaymentsPage() {
  const { user } = useAuth();
  const role = user?.role || 'USER';

  // If role is USER, render dedicated customer payments and receipts ledger
  if (role === 'USER') {
    return <UserPaymentsView user={user} />;
  }

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [showManualModal, setShowManualModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Form states for manual payment
  const [unpaidAppointments, setUnpaidAppointments] = useState([]);
  const [manualAppointmentId, setManualAppointmentId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualMethod, setManualMethod] = useState('CASH');
  const [manualNotes, setManualNotes] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState('');

  // Form states for refund
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundError, setRefundError] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, modeFilter, page]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        paymentService.getPayments({
          status: statusFilter || undefined,
          paymentMode: modeFilter || undefined,
          search: searchTerm || undefined,
          page,
          limit: 15,
        }),
        paymentService.getStats(),
      ]);

      setPayments(paymentsRes.data?.payments || []);
      setTotalPages(paymentsRes.data?.pagination?.totalPages || 1);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const openManualPaymentModal = async () => {
    setManualError('');
    setManualAppointmentId('');
    setManualAmount('');
    setManualNotes('');
    setManualMethod('CASH');
    setShowManualModal(true);

    try {
      const res = await appointmentService.getAppointments({ limit: 100 });
      const pendingList = (res.data?.appointments || []).filter(
        (a) => a.paymentStatus !== 'PAID' && a.status !== 'CANCELLED'
      );
      setUnpaidAppointments(pendingList);
      if (pendingList.length > 0) {
        setManualAppointmentId(pendingList[0]._id);
        setManualAmount(String(pendingList[0].fee || 500));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualAppointmentId) {
      setManualError('Please select an appointment');
      return;
    }
    setSubmittingManual(true);
    setManualError('');
    try {
      await paymentService.recordManualPayment({
        appointmentId: manualAppointmentId,
        amount: manualAmount ? Number(manualAmount) : undefined,
        paymentMethod: manualMethod,
        notes: manualNotes,
      });
      setShowManualModal(false);
      showToast('Offline payment recorded successfully!');
      loadData();
    } catch (err) {
      setManualError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmittingManual(false);
    }
  };

  const openRefundModal = (payment) => {
    setSelectedPayment(payment);
    setRefundAmount(String(payment.amount - (payment.refundAmount || 0)));
    setRefundReason('');
    setRefundError('');
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundReason.trim()) {
      setRefundError('Please provide a reason for the refund.');
      return;
    }
    setSubmittingRefund(true);
    setRefundError('');
    try {
      await paymentService.processRefund(selectedPayment._id, {
        amount: refundAmount ? Number(refundAmount) : undefined,
        reason: refundReason.trim(),
      });
      setShowRefundModal(false);
      showToast('Refund processed successfully!');
      loadData();
    } catch (err) {
      setRefundError(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const openInvoiceModal = async (payment) => {
    setSelectedPayment(payment);
    setLoadingInvoice(true);
    setShowInvoiceModal(true);
    try {
      const res = await paymentService.getInvoice(payment._id);
      setInvoiceData(res.data);
    } catch (err) {
      showToast('Failed to load invoice details');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3.5 h-3.5" />
            Refunded
          </span>
        );
      case 'PARTIALLY_REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3.5 h-3.5" />
            Partially Refunded
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 w-full pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Billing Engine & Adapter Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Payments & Invoicing</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Track customer consultations, process offline cash payments, issue refunds, and generate tax receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={openManualPaymentModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-xs font-bold px-4 py-2.5"
          >
            <Plus className="w-4 h-4" />
            Record Clinic Payment
          </Button>
          <Button
            variant="outline"
            onClick={loadData}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold px-3 py-2.5"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Gateway Architecture Notice Banner */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold">Active Driver: Simulated Gateway Adapter.</span> Built-in testing mode is active.
            To connect live gateways (Razorpay, Stripe), supply credentials in backend configuration.
          </div>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Collected</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatINR(stats?.totalCollected || 0)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{stats?.statusBreakdown?.SUCCESS || 0} successful payments</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Month</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatINR(stats?.monthCollected || 0)}
          </div>
          <p className="mt-2 text-xs text-slate-500">Collected in current calendar month</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending / In-Clinic</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {formatINR(stats?.pendingAmount || 0)}
          </div>
          <p className="mt-2 text-xs text-slate-500">{stats?.statusBreakdown?.PENDING || 0} pending collections</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Refunded</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight">
            {formatINR(stats?.refundedAmount || 0)}
          </div>
          <p className="mt-2 text-xs text-slate-500">{stats?.statusBreakdown?.REFUNDED || 0} refunded orders</p>
        </div>
      </div>

      {/* Main Transactions Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, phone, or invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('');
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-bold transition-colors',
                  statusFilter === '' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('SUCCESS');
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-bold transition-colors',
                  statusFilter === 'SUCCESS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('PENDING');
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-bold transition-colors',
                  statusFilter === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('REFUNDED');
                  setPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-bold transition-colors',
                  statusFilter === 'REFUNDED'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Refunded
              </button>
            </div>

            {/* Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Payment Modes</option>
              <option value="ONLINE">Online Checkout</option>
              <option value="PAY_AT_CLINIC">Pay at Clinic / Venue</option>
              <option value="FREE">Free Consultation</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RotateCcw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs font-semibold">Loading transactions...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No payment records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
              Payments made via public booking links or recorded in person at your clinic will appear here.
            </p>
            <Button
              onClick={openManualPaymentModal}
              className="bg-indigo-600 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Record In-Person Payment
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View (lg and above) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Invoice / Code</th>
                    <th className="px-6 py-3.5">Customer Details</th>
                    <th className="px-6 py-3.5">Appointment</th>
                    <th className="px-6 py-3.5">Amount & Method</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">{p.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.paymentCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.customerName}</div>
                        <div className="text-[11px] text-slate-500">{p.customerPhone}</div>
                        {p.customerEmail && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {p.customerEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {p.appointmentId ? (
                          <>
                            <div className="font-bold text-slate-900">
                              {p.appointmentId.appointmentTypeName || 'Consultation'}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {formatDisplayDate(p.appointmentId.dateString)} •{' '}
                              {format12Hour(p.appointmentId.startTime)}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">Direct Payment</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {formatINR(p.amount)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {p.paymentMethod}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {p.paymentMode === 'PAY_AT_CLINIC' ? 'In Clinic' : 'Online'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => openInvoiceModal(p)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-xl text-xs font-bold"
                            title="View Invoice"
                          >
                            <Receipt className="w-4 h-4" />
                          </Button>

                          {p.status === 'SUCCESS' && p.amount > 0 && (
                            <Button
                              variant="ghost"
                              onClick={() => openRefundModal(p)}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-xl text-xs font-bold"
                              title="Issue Refund"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View (< lg) */}
            <div className="lg:hidden divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  {/* Top Row: Invoice Code & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">{p.invoiceNumber}</span>
                      <span className="text-[10px] font-mono text-slate-400">{p.paymentCode}</span>
                    </div>
                    <div>{getStatusBadge(p.status)}</div>
                  </div>

                  {/* Middle Row: Patient & Appointment Details */}
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{p.customerName}</p>
                      <p className="text-[11px] text-slate-500">{p.customerPhone}</p>
                      {p.appointmentId && (
                        <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                          {p.appointmentId.appointmentTypeName || 'Consultation'} • {formatDisplayDate(p.appointmentId.dateString)}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-slate-900 block">{formatINR(p.amount)}</span>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {p.paymentMethod}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.paymentMode === 'PAY_AT_CLINIC' ? 'Clinic' : 'Online'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInvoiceModal(p)}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-bold py-1.5 px-3"
                    >
                      <Receipt className="w-3.5 h-3.5 mr-1" /> View Receipt
                    </Button>

                    {p.status === 'SUCCESS' && p.amount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openRefundModal(p)}
                        className="text-rose-600 hover:bg-rose-50 text-xs font-bold py-1.5 px-2.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Refund
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3 py-1.5"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-1.5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Record In-Person / Offline Payment Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Record Clinic Payment</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {manualError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {manualError}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Customer Appointment
                </label>
                {unpaidAppointments.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    No pending unpaid appointments found.
                  </p>
                ) : (
                  <select
                    value={manualAppointmentId}
                    onChange={(e) => {
                      setManualAppointmentId(e.target.value);
                      const match = unpaidAppointments.find((a) => a._id === e.target.value);
                      if (match) setManualAmount(String(match.fee || 500));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {unpaidAppointments.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.customerName} - {a.appointmentTypeName} ({a.dateString}) [₹{a.fee}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Amount Collected (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['CASH', 'UPI', 'CARD'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setManualMethod(m)}
                      className={cn(
                        'py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center',
                        manualMethod === m
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Receipt Note (Optional)
                </label>
                <Input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g., Paid cash at reception"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowManualModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingManual || unpaidAppointments.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {submittingManual ? 'Recording...' : 'Confirm Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Issue Payment Refund</h3>
              </div>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {refundError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {refundError}
              </div>
            )}

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-bold text-slate-900">{selectedPayment.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{selectedPayment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-bold text-slate-900">{formatINR(selectedPayment.amount)}</span>
              </div>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Refund Amount (₹)
                </label>
                <Input
                  type="number"
                  min="1"
                  max={selectedPayment.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason for Refund
                </label>
                <textarea
                  rows="3"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g., Appointment cancelled, customer requested reschedule"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRefundModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingRefund}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  {submittingRefund ? 'Processing...' : 'Process Refund'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice & Receipt Preview Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Tax Invoice & Receipt</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="p-2 text-slate-600 hover:text-slate-900 text-xs"
                  title="Print Receipt"
                >
                  <Printer className="w-4 h-4" />
                </Button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingInvoice ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <RotateCcw className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs font-semibold">Generating invoice...</p>
              </div>
            ) : invoiceData ? (
              <div className="overflow-y-auto py-6 space-y-6 text-xs text-slate-700 pr-1">
                {/* Invoice Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {invoiceData.professional?.name || 'Professional'}
                    </h2>
                    <p className="text-slate-500 font-semibold">
                      {invoiceData.professional?.profession} • {invoiceData.professional?.specialization}
                    </p>
                    {invoiceData.professional?.address && (
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                        {invoiceData.professional.address}, {invoiceData.professional.city},{' '}
                        {invoiceData.professional.state}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-indigo-600">INVOICE</div>
                    <div className="text-sm font-extrabold text-slate-900">{invoiceData.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Date: {formatDisplayDate(new Date(invoiceData.paidAt).toISOString().slice(0, 10))}
                    </div>
                  </div>
                </div>

                {/* Billed To */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Billed To
                    </span>
                    <div className="font-bold text-slate-900 mt-0.5">{invoiceData.customer?.name}</div>
                    <div className="text-slate-500 text-[11px]">{invoiceData.customer?.phone}</div>
                    {invoiceData.customer?.email && (
                      <div className="text-slate-400 text-[11px]">{invoiceData.customer?.email}</div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Status
                    </span>
                    <div className="mt-1">{getStatusBadge(invoiceData.paymentStatus)}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Method: {invoiceData.paymentMethod}
                    </div>
                  </div>
                </div>

                {/* Line Item Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">
                            {invoiceData.appointment?.serviceName || 'Consultation Service'}
                          </div>
                          {invoiceData.appointment && (
                            <div className="text-[11px] text-slate-400">
                              Schedule: {formatDisplayDate(invoiceData.appointment.dateString)} at{' '}
                              {format12Hour(invoiceData.appointment.startTime)}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right font-medium">1</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {formatINR(invoiceData.amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Total Calculation */}
                <div className="flex justify-end">
                  <div className="w-60 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatINR(invoiceData.amount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Taxes / GST:</span>
                      <span className="font-semibold">₹0.00 (Inclusive)</span>
                    </div>
                    {invoiceData.refundAmount > 0 && (
                      <div className="flex justify-between text-rose-600 font-semibold">
                        <span>Refunded:</span>
                        <span>-{formatINR(invoiceData.refundAmount)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                      <span>Total Paid:</span>
                      <span>
                        {formatINR(invoiceData.amount - (invoiceData.refundAmount || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                  Thank you for booking with BookSaathi. Computer-generated invoice.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
