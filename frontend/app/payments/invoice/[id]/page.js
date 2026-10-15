'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  Phone,
  Mail,
  Receipt,
  Sparkles,
  ExternalLink,
  QrCode,
  FileCheck,
} from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { formatINR, formatDisplayDate, format12Hour } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function InvoicePage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams?.id;
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    loadInvoice();
  }, [id, token]);

  const loadInvoice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentService.getInvoice(id, { token });
      setInvoice(res.data);
    } catch (err) {
      console.error('Invoice fetch error:', err);
      setError(
        err.response?.data?.message ||
          'Unable to load invoice. Please verify the link or sign in.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-lg animate-spin mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Loading Official Receipt...</h2>
        <p className="text-xs text-slate-500 mt-1">Generating verified tax invoice ledger</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Receipt Not Available</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {error || 'The requested invoice could not be located or you do not have permission to view it.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/lookup"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <span>Lookup by Phone</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pro = invoice.professional || {};
  const cust = invoice.customer || {};
  const appt = invoice.appointment || {};
  const isPaid = invoice.paymentStatus === 'SUCCESS' || invoice.paymentStatus === 'PAID';
  const isRefunded = invoice.paymentStatus === 'REFUNDED' || invoice.paymentStatus === 'PARTIALLY_REFUNDED';
  const isPayAtClinic = invoice.paymentMode === 'PAY_AT_CLINIC';

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 sm:py-12 px-3.5 sm:px-6 font-sans text-slate-900 selection:bg-indigo-600 selection:text-white print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-4">
        
        {/* Navigation & Action Bar (Hidden on Print) */}
        <div className="flex items-center justify-between gap-3 px-1 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BookSaathi Network</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs text-xs font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </div>

        {/* 📄 Official Tax Invoice Sheet */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          
          {/* Top Decorative Border */}
          <div className="h-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 print:hidden" />

          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Header: Brand & Invoice Meta */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                    <Receipt className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-black text-slate-900 text-lg tracking-tight">
                    Book<span className="text-indigo-600">Saathi</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider ml-1 border border-slate-200">
                    Official Tax Receipt
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Verified Consultation & Practice Billing Document
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="text-xs uppercase font-extrabold text-indigo-700 tracking-wider">
                  Invoice Number
                </div>
                <div className="text-xl font-black font-mono text-slate-900">
                  {invoice.invoiceNumber || 'INV-2026-000000'}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Ref Code: <span className="font-bold text-slate-700">{invoice.paymentCode}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Date: {formatDisplayDate(invoice.paidAt || new Date().toISOString())}
                </div>
              </div>
            </div>

            {/* Provider and Customer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
              
              {/* Professional / Clinic Details */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Service Provider / Clinic
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  {pro.name || 'Practitioner'}
                </h3>
                <p className="text-indigo-600 font-bold">
                  {pro.profession || 'Healthcare Consultant'}{' '}
                  {pro.specialization ? `• ${pro.specialization}` : ''}
                </p>
                {pro.businessName && (
                  <p className="text-slate-700 font-medium">{pro.businessName}</p>
                )}
                {pro.address && (
                  <p className="text-slate-500 leading-relaxed">
                    {pro.address}, {pro.city} {pro.state ? `, ${pro.state}` : ''}
                  </p>
                )}
                {pro.phone && (
                  <p className="text-slate-500 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" /> +91 {pro.phone}
                  </p>
                )}
              </div>

              {/* Patient / Customer Details */}
              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-6 pt-4 sm:pt-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Billed To (Patient / Client)
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  {cust.name || 'Customer'}
                </h3>
                {cust.phone && (
                  <p className="text-slate-600 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> +91 {cust.phone}
                  </p>
                )}
                {cust.email && (
                  <p className="text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> {cust.email}
                  </p>
                )}
                {appt.appointmentCode && (
                  <p className="text-slate-500 pt-1">
                    Booking Code:{' '}
                    <span className="font-mono font-bold text-slate-800">
                      #{appt.appointmentCode}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-4 text-center">Schedule</th>
                    <th className="py-3 px-4 text-right">Fee (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-4 px-4 space-y-1">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {appt.serviceName || 'Consultation Service'}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Professional Consultation & Clinical Assessment
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-slate-700">
                      <div>{formatDisplayDate(appt.dateString || invoice.paidAt)}</div>
                      {appt.startTime && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          {format12Hour(appt.startTime)} ({appt.duration || 30} mins)
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-black font-mono text-slate-900 text-sm">
                      {formatINR(invoice.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Calculation Footer */}
              <div className="bg-slate-50/70 p-4 border-t border-slate-200 flex flex-col items-end space-y-2 text-xs">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Consultation Subtotal</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatINR(invoice.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Healthcare GST (0% Exempt)</span>
                    <span className="font-mono">₹0.00</span>
                  </div>
                  {invoice.refundAmount > 0 && (
                    <div className="flex justify-between text-purple-700 font-bold pt-1 border-t border-slate-200">
                      <span>Refunded Amount</span>
                      <span className="font-mono">- {formatINR(invoice.refundAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                    <span>Total Net Paid</span>
                    <span className="font-mono text-indigo-700">
                      {formatINR(Math.max(0, invoice.amount - (invoice.refundAmount || 0)))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary & Transaction Proof */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-slate-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Payment Status:</span>
                  {invoice.isDemo || invoice.paymentStatus === 'DEMO_PAID' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      DEMO PAID / SIMULATED
                    </span>
                  ) : isPaid ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      PAID / CONFIRMED
                    </span>
                  ) : isRefunded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[11px]">
                      <RotateCcw className="w-3.5 h-3.5" />
                      REFUNDED
                    </span>
                  ) : isPayAtClinic ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      PAY AT CLINIC
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                      {invoice.paymentStatus}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
                  <div>
                    Method: <strong className="text-slate-800 font-sans">{invoice.paymentMethod || 'CASHFREE'}</strong> • Mode: <span className="font-sans">{invoice.paymentMode}</span>
                  </div>
                  <div>Provider: {invoice.gatewayProvider || 'CASHFREE'} {invoice.isDemo ? '(Demo Mode)' : ''}</div>
                </div>
              </div>

              {/* Digital Verification Seal */}
              <div className="text-right sm:text-right shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-200/80 shadow-xs text-[11px] font-bold text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{invoice.isDemo ? 'Cashfree Demo Mode' : '256-Bit Digitally Verified'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="pt-4 border-t border-slate-200 text-center space-y-1 text-[11px] text-slate-400">
              <p>
                This is a computer-generated tax invoice and billing voucher generated by{' '}
                <strong className="text-slate-600">BookSaathi Scheduling System</strong> on behalf of{' '}
                <strong className="text-slate-600">{pro.name || 'the professional'}</strong>.
              </p>
              <p>For inquiries or refunds, contact your consultation provider directly with invoice #{invoice.invoiceNumber}.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
