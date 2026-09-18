'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Laptop,
  Smartphone,
  Tablet,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  XCircle,
  Clock,
  Globe,
  Radio,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function LoginActivityCard({ className = '' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchActivity = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await authService.getLoginActivity({ page: targetPage, limit: 10 });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load login activity');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchActivity(page);
  }, [fetchActivity, page]);

  const getDeviceIcon = (deviceType) => {
    const type = (deviceType || '').toLowerCase();
    if (type === 'mobile') return <Smartphone className="w-4 h-4" />;
    if (type === 'tablet') return <Tablet className="w-4 h-4" />;
    return <Laptop className="w-4 h-4" />;
  };

  const getEventBadge = (eventType, isCurrent) => {
    if (isCurrent) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Session</span>
        </span>
      );
    }

    switch (eventType) {
      case 'LOGIN_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Login successful</span>
          </span>
        );
      case 'SESSION_REPLACED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[10px] border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Session replaced</span>
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
            <LogOut className="w-3 h-3 text-slate-500" />
            <span>Logged out</span>
          </span>
        );
      case 'LOGIN_FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[10px] border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Failed login</span>
          </span>
        );
      case 'SESSION_REVOKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[10px] border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Session revoked</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
            {eventType}
          </span>
        );
    }
  };

  const currentSession = data?.currentSession;
  const logs = data?.logs || [];
  const pagination = data?.pagination;

  return (
    <div className={cn('bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Login Activity & Security</h3>
              <p className="text-xs text-slate-500">
                Monitor your active login sessions and account authentication history.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchActivity(page)}
          disabled={loading}
          className="text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* 1. Current Session Highlight Card */}
      {currentSession && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-emerald-50/40 border border-indigo-100/80 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                {getDeviceIcon(currentSession.deviceType)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-900">
                    {currentSession.browser || 'Current Browser'} on {currentSession.operatingSystem || 'Current OS'}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Current Active Session</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
                  <span>IP: {currentSession.ipAddress}</span>
                  <span>•</span>
                  <span>
                    Started: {new Date(currentSession.loginAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST
                  </span>
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 sm:text-right">
              <span className="inline-block bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700 text-[10px]">
                Single Active Login Enforced
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Previous Activity Timeline */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Previous Activity History
        </h4>

        {loading && logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <RotateCcw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
            <span>Loading authentication logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            No previous login logs recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
            {logs.map((log) => {
              return (
                <div
                  key={log._id}
                  className={cn(
                    'p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-white',
                    log.isCurrentSession && 'bg-emerald-50/30'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs mt-0.5">
                      {getDeviceIcon(log.deviceType)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {log.browser} • {log.operatingSystem}
                        </span>
                        {getEventBadge(log.eventType, log.isCurrentSession)}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap font-mono">
                        <span>IP: {log.ipAddress}</span>
                        {log.details?.reason && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 font-sans">{log.details.reason}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 sm:text-right shrink-0">
                    <span>
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total logs)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
