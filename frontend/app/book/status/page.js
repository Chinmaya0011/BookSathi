'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Download,
  Home,
} from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { formatINR, formatDisplayDate, format12Hour } from '@/lib/utils';
import Button from '@/components/ui/Button';
import confetti from 'canvas-confetti';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is missing from the callback URL.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function checkStatus() {
      setLoading(true);
      setError(null);
      try {
        const res = await paymentService.getOrderStatus(orderId);
        if (isMounted) {
          setStatusData(res.data);
          if (res.data?.status === 'SUCCESS' || res.data?.isPaid) {
            try {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to verify payment status with server.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-lg animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900">Verifying Cashfree Payment...</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            Please wait while we verify your transaction status with the payment gateway.
          </p>
        </div>
      </div>
    );
  }

  const isSuccess = statusData?.status === 'SUCCESS' || statusData?.isPaid;
  const appointment = statusData?.appointment;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 text-slate-900 text-center animate-in zoom-in-95">
        
        {/* Status Icon */}
        <div className="mx-auto">
          {isSuccess ? (
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-9 h-9" />
            </div>
          )}
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isSuccess ? 'Payment Successful!' : 'Payment Incomplete / Failed'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isSuccess
              ? 'Your consultation booking is confirmed and secured.'
              : error || 'Your payment could not be confirmed. If amount was deducted, it will be refunded automatically.'}
          </p>
        </div>

        {/* Transaction Summary Card */}
        {statusData && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 font-bold">Amount Paid</span>
              <span className="text-base font-black text-slate-900 font-mono">
                {formatINR(statusData.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Order ID</span>
              <span className="font-mono text-slate-800 text-[11px]">{statusData.orderId}</span>
            </div>
            {statusData.paymentMethod && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold text-slate-800">{statusData.paymentMethod}</span>
              </div>
            )}
            {appointment && (
              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Patient</span>
                  <span className="font-bold text-slate-800">{appointment.customerName}</span>
                </div>
                {appointment.dateString && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-slate-800">
                      {formatDisplayDate(appointment.dateString)}
                    </span>
                  </div>
                )}
                {appointment.startTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Time Slot</span>
                    <span className="font-bold text-slate-800">
                      {format12Hour(appointment.startTime)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="space-y-2 pt-2">
          {isSuccess && appointment?.appointmentCode ? (
            <Link
              href={`/book/manage?code=${appointment.appointmentCode}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/25 transition-all"
            >
              <span>View & Manage Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          )}

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified by Cashfree Payments</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-pulse text-xs font-bold text-slate-500">
            Loading Payment Status...
          </div>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
