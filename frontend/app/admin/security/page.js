'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  XCircle,
  Activity,
  Users,
  Calendar,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchSecurityLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getSecurityLoginActivity({
        role: roleFilter || undefined,
        eventType: eventTypeFilter || undefined,
        status: statusFilter || undefined,
        search: search ? search.trim() : undefined,
        page,
        limit: 20,
      });

      if (res.data) {
        setLogs(res.data.logs || []);
        setKpis(res.data.kpis || null);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load platform security logs');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, eventTypeFilter, statusFilter, search, page]);

  useEffect(() => {
    fetchSecurityLogs();
  }, [fetchSecurityLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSecurityLogs();
  };

  const getDeviceIcon = (deviceType) => {
    const type = (deviceType || '').toLowerCase();
    if (type === 'mobile') return <Smartphone className="w-3.5 h-3.5" />;
    if (type === 'tablet') return <Tablet className="w-3.5 h-3.5" />;
    return <Laptop className="w-3.5 h-3.5" />;
  };

  const getEventBadge = (eventType, status) => {
    switch (eventType) {
      case 'LOGIN_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>LOGIN_SUCCESS</span>
          </span>
        );
      case 'SESSION_REPLACED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>SESSION_REPLACED</span>
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[10px] border border-slate-700">
            <LogOut className="w-3 h-3 text-slate-400" />
            <span>LOGOUT</span>
          </span>
        );
      case 'LOGIN_FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>LOGIN_FAILED</span>
          </span>
        );
      case 'SESSION_REVOKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>SESSION_REVOKED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[10px]">
            {eventType}
          </span>
        );
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-extrabold text-[10px] border border-rose-500/30">
            ADMIN
          </span>
        );
      case 'PROFESSIONAL':
        return (
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">
            PRO
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold text-[10px] border border-blue-500/30">
            CUSTOMER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Authentication Security & Single Active Session Monitoring</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Security & Login Activity Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time platform-wide audit trail of authentication events, multi-device session replacements, and failed login attempts.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchSecurityLogs}
          className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold shrink-0 cursor-pointer"
        >
          <RotateCcw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} />
          Refresh Activity
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Successful Logins (24h)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {kpis?.successfulLogins24h ?? 0}
          </div>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active authentication traffic</span>
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Failed Attempts (24h)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">
            {kpis?.failedAttempts24h ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">
            Guarded by 5-attempt rate lockout
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Session Replacements (24h)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {kpis?.sessionsReplaced24h ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">
            Prior sessions automatically invalidated
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Session Policy</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-200 mt-1">
            Single Active Session
          </div>
          <p className="text-[10px] text-indigo-400 font-semibold">
            Strict Multi-Device Invalidation
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by email or IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>
          <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="">All Roles</option>
            <option value="USER">Customer / User</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ADMIN">Administrator</option>
          </select>

          {/* Event Type Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="">All Event Types</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="SESSION_REPLACED">SESSION_REPLACED</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="SESSION_REVOKED">SESSION_REVOKED</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Timestamp (IST)</th>
                <th className="py-3.5 px-4">Account Email & Role</th>
                <th className="py-3.5 px-4">Event Code</th>
                <th className="py-3.5 px-4">Device & Client</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Session Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    <RotateCcw className="w-6 h-6 animate-spin mx-auto text-rose-500 mb-2" />
                    <span>Loading platform security logs...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    No security activity records match the selected criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors text-[11px]">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Account & Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-white truncate max-w-[180px]">
                          {log.userEmail}
                        </span>
                        {getRoleBadge(log.userRole)}
                      </div>
                    </td>

                    {/* Event Code */}
                    <td className="py-3.5 px-4">
                      {getEventBadge(log.eventType, log.status)}
                    </td>

                    {/* Device & Client */}
                    <td className="py-3.5 px-4 text-slate-300 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">{getDeviceIcon(log.deviceType)}</span>
                        <span>{log.browser}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{log.operatingSystem}</span>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    {/* Session Context / Reason */}
                    <td className="py-3.5 px-4 text-slate-400 font-sans text-[11px] max-w-xs truncate">
                      {log.details?.reason ? (
                        <span className="text-slate-300">{log.details.reason}</span>
                      ) : log.sessionId ? (
                        <span className="font-mono text-[10px] text-slate-500">
                          ID: {log.sessionId.slice(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} security events total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs border-slate-700 text-slate-300"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs border-slate-700 text-slate-300"
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
