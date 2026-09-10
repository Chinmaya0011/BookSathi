'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  RotateCcw,
  ShieldCheck,
  Calendar,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import { formatDisplayDate, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        targetType: targetTypeFilter || undefined,
        page,
        limit: 20,
      });
      setLogs(res.data?.logs || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load system audit logs');
    } finally {
      setLoading(false);
    }
  }, [targetTypeFilter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Compliance & Audit Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            System Activity & Administrative Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable chronological record of all administrative operations, status overrides, and platform configuration updates.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchLogs}
          className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Logs
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={targetTypeFilter}
            onChange={(e) => {
              setTargetTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="">All Target Types</option>
            <option value="USER">User Accounts</option>
            <option value="PROFESSIONAL">Professional Profiles</option>
            <option value="APPOINTMENT">Appointments</option>
            <option value="PAYMENT">Payments</option>
            <option value="SYSTEM">System & QR Orders</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {logs.length} entries (Page {page})
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Timestamp (IST)</th>
                <th className="py-3.5 px-4">Admin Email</th>
                <th className="py-3.5 px-4">Action Code</th>
                <th className="py-3.5 px-4">Target Type</th>
                <th className="py-3.5 px-4">Target ID</th>
                <th className="py-3.5 px-4">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    <RotateCcw className="w-6 h-6 animate-spin mx-auto text-rose-500 mb-2" />
                    <span>Loading system audit logs...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    No audit records match the selected filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors text-[11px]">
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

                    <td className="py-3.5 px-4 text-white font-sans font-bold">
                      {log.adminEmail}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[10px]">
                        {log.targetType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 truncate max-w-xs">
                      {log.targetId || 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-sans text-xs">
                      <pre className="text-[10px] bg-slate-950 p-2 rounded-xl text-slate-300 overflow-x-auto max-w-sm">
                        {JSON.stringify(log.details || {}, null, 1)}
                      </pre>
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
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} audit logs total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs border-slate-700 text-slate-300"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
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
