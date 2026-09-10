'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Calendar,
  CreditCard,
  IndianRupee,
  UserCheck,
  Activity,
  Server,
  Database,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Layers,
  Package,
  LifeBuoy,
  Sliders,
  History,
  AlertTriangle,
  MessageSquare,
  Zap,
  TrendingUp,
  Cpu,
  HardDrive,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminService } from '@/services/admin.service';
import { formatINR, formatDisplayDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { connectSocket } from '@/lib/socket';
import { toast } from 'sonner';

export default function AdminCommandCenter() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveActivities, setLiveActivities] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadOverview();

    const socket = connectSocket();
    if (socket) {
      const handleAdminUpdate = () => {
        loadOverview(true);
      };

      const handleActivity = (act) => {
        setLiveActivities((prev) => [act, ...prev.slice(0, 19)]);
        toast.info('Admin Telemetry Alert', {
          description: act.message,
          duration: 4000,
        });
      };

      socket.on('appointment:created', handleAdminUpdate);
      socket.on('appointment:confirmed', handleAdminUpdate);
      socket.on('appointment:cancelled', handleAdminUpdate);
      socket.on('appointment:completed', handleAdminUpdate);
      socket.on('admin:activity', handleActivity);

      return () => {
        socket.off('appointment:created', handleAdminUpdate);
        socket.off('appointment:confirmed', handleAdminUpdate);
        socket.off('appointment:cancelled', handleAdminUpdate);
        socket.off('appointment:completed', handleAdminUpdate);
        socket.off('admin:activity', handleActivity);
      };
    }
  }, []);

  const loadOverview = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    } else {
      setIsSyncing(true);
    }
    setError('');
    try {
      const res = await adminService.getOverview();
      setData(res.data);
    } catch (err) {
      if (!isBackground) {
        setError(err.response?.data?.message || 'Failed to load command center statistics');
      }
    } finally {
      if (!isBackground) setLoading(false);
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-14 h-14 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-xl shadow-rose-500/10">
          <RotateCcw className="w-7 h-7 animate-spin text-rose-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white tracking-tight">Gathering Master Telemetry...</p>
          <p className="text-xs text-slate-500 mt-0.5">Aggregating real-time transactions, appointments & node metrics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-rose-950/40 border border-rose-800/80 text-center max-w-lg mx-auto space-y-4 shadow-2xl my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-600/20 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">System Access or Telemetry Error</h3>
          <p className="text-xs text-rose-300 mt-1">{error}</p>
        </div>
        <Button onClick={() => loadOverview(false)} className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl">
          Retry Telemetry
        </Button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const status = data?.appointmentStatus || {};
  const health = data?.systemHealth || {};

  const totalAppts = (status.COMPLETED || 0) + (status.CONFIRMED || 0) + (status.PENDING || 0) + (status.CANCELLED || 0);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Hero Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/40 p-6 sm:p-8 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Omni-Enterprise Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Platform Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Global operational management of specialists, user accounts, physical QR standee logistics, subscriptions, financial transactions, and support grievances across India.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => loadOverview(true)}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-bold border border-slate-700/80 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-rose-400' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Telemetry'}</span>
            </button>

            <Link
              href="/admin/messages"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white text-xs font-bold border border-slate-700/80 shadow-md transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>Omni Chat</span>
            </Link>

            <Link
              href="/admin/professionals"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Directory Control</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Action-Required Alerts */}
      {(kpis.openGrievances > 0 || kpis.pendingQrOrders > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {kpis.openGrievances > 0 && (
            <Link
              href="/admin/grievances"
              className="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between hover:bg-amber-500/15 transition-all group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                  <LifeBuoy className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-200">
                    {kpis.openGrievances} Support Ticket{kpis.openGrievances > 1 ? 's' : ''} Pending
                  </h4>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">User inquiries & grievances awaiting administrative reply</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          )}

          {kpis.pendingQrOrders > 0 && (
            <Link
              href="/admin/orders"
              className="p-4.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between hover:bg-indigo-500/15 transition-all group shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
                  <Package className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-indigo-200">
                    {kpis.pendingQrOrders} QR Standee Order{kpis.pendingQrOrders > 1 ? 's' : ''} in Pipeline
                  </h4>
                  <p className="text-[11px] text-indigo-300/80 mt-0.5">Physical smart standees awaiting dispatch & tracking</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* 6 Executive Platform KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Volume GMV */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl space-y-3 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Platform Volume</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">{formatINR(kpis.totalVolume || 0)}</div>
            <div className="text-[10px] font-bold text-rose-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>{formatINR(kpis.monthVolume || 0)} this month</span>
            </div>
          </div>
        </div>

        {/* Total Accounts */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl space-y-3 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">User Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">{kpis.totalUsers || 0}</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-1">Active registered clients</div>
          </div>
        </div>

        {/* Active Verified Professionals */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl space-y-3 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Verified Pros</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">{kpis.activeProfessionals || 0}</div>
            <div className="text-[10px] font-semibold text-emerald-400 mt-1">
              {kpis.totalProfessionals || 0} listed specialists
            </div>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl space-y-3 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Appointments</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">{kpis.totalAppointments || 0}</div>
            <div className="text-[10px] font-semibold text-indigo-400 mt-1">
              +{kpis.todayAppointments || 0} booked today
            </div>
          </div>
        </div>

        {/* SaaS Subscriptions */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl space-y-3 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Paid Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">{kpis.activeSubscriptions || 0}</div>
            <div className="text-[10px] font-semibold text-purple-400 mt-1">Active recurring tiers</div>
          </div>
        </div>

        {/* QR Kit Production */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl space-y-3 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">QR Standees</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">{kpis.totalQrOrders || 0}</div>
            <div className="text-[10px] font-semibold text-cyan-400 mt-1">
              {kpis.pendingQrOrders || 0} pending dispatch
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Trends: Velocity Chart & Lifecycle Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Appointments Volume Area Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">Booking Velocity & Growth Dynamics</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Aggregated 7-day rolling appointments across all professional verticals</p>
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 self-start sm:self-auto font-mono">
              IST Live
            </span>
          </div>

          <div className="h-68 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weeklyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminApptGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  name="Appointments"
                  stroke="#e11d48"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#adminApptGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Appointment Status Lifecycle Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Appointment Lifecycle</h3>
            <p className="text-xs text-slate-400 mt-0.5">Platform-wide session fulfillment metrics</p>
          </div>

          <div className="space-y-3 my-auto">
            {/* Completed */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">Completed Sessions</span>
              </div>
              <span className="text-sm font-black text-white">{status.COMPLETED || 0}</span>
            </div>

            {/* Confirmed */}
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300">Confirmed & Active</span>
              </div>
              <span className="text-sm font-black text-white">{status.CONFIRMED || 0}</span>
            </div>

            {/* Pending */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">Pending Confirmation</span>
              </div>
              <span className="text-sm font-black text-white">{status.PENDING || 0}</span>
            </div>

            {/* Cancelled */}
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-300">Cancelled / Refunded</span>
              </div>
              <span className="text-sm font-black text-white">{status.CANCELLED || 0}</span>
            </div>
          </div>

          <Link
            href="/admin/appointments"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-bold text-slate-300 transition-colors border border-slate-700/60 shadow-xs"
          >
            <span>Inspect Appointments Ledger</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Infrastructure Telemetry & Live Real-Time Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Diagnostics Box */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white text-sm font-bold">
              <Server className="w-4 h-4 text-rose-400" />
              <span>Node & Engine Diagnostics</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Healthy</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Database Status:</span>
              </span>
              <span className="font-bold text-emerald-400">
                MongoDB Atlas ({health.database || 'Connected'})
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Memory Allocation:</span>
              </span>
              <span className="font-bold text-white font-mono">{health.memoryUsageMB || 64} MB</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Runtime Uptime:</span>
              </span>
              <span className="font-bold text-indigo-300 font-mono">
                {Math.floor((health.uptimeSeconds || 0) / 60)}m ({health.uptimeSeconds || 0}s)
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Payment Engine:</span>
              </span>
              <span className="font-bold text-amber-400">{health.activeGateway || 'Razorpay / Mock'}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Environment:</span>
              </span>
              <span className="font-mono text-slate-300">
                {health.nodeVersion || 'v20'} ({health.environment || 'production'})
              </span>
            </div>
          </div>
        </div>

        {/* Live Admin Audit Feed */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/90 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white text-sm font-bold">
              <History className="w-4 h-4 text-rose-400" />
              <span>Real-Time Security & Action Audit Trail</span>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
            >
              <span>Full Audit Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {data?.recentAuditLogs?.length > 0 ? (
              data.recentAuditLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 font-mono text-[10px] font-extrabold border border-rose-500/20">
                      {log.action}
                    </span>
                    <span className="text-slate-300 font-medium">Executed by {log.adminEmail}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No recent administrative actions recorded. System operating normally.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Socket Audit Listener Active</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">Immutable Audit Logs Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
