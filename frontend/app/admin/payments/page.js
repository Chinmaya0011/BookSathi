'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Receipt,
  Download,
  Filter,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { formatINR, formatDisplayDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPayments();
  }, [statusFilter, modeFilter, page]);

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getPayments({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        paymentMode: modeFilter || undefined,
        page,
        limit: 15,
      });

      setPayments(res.data?.payments || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadPayments();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Refunded
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Platform Revenue & Financial Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global view of all online gateway transactions, in-person clinic cash records, and refunds.
          </p>
        </div>

        <Button
          onClick={loadPayments}
          variant="outline"
          className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-bold"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Refresh Ledger
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number, patient, or doctor..."
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
            <option value="">All Payment Statuses</option>
            <option value="SUCCESS">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="">All Modes</option>
            <option value="ONLINE">Online Checkout</option>
            <option value="PAY_AT_CLINIC">Pay at Clinic / In-Person</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RotateCcw className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-xs font-semibold">Querying system transactions...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No payment transactions found</h3>
            <p className="text-xs text-slate-500 mt-1">Transactions across all doctor booking links will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Invoice / Txn Code</th>
                  <th className="px-6 py-4">Patient Details</th>
                  <th className="px-6 py-4">Doctor / Beneficiary</th>
                  <th className="px-6 py-4">Amount & Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-extrabold text-white">{p.invoiceNumber}</div>
                      <div className="font-mono text-[10px] text-slate-500">{p.paymentCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{p.customerName}</div>
                      <div className="text-[11px] text-slate-400">{p.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.professionalId ? (
                        <>
                          <div className="font-bold text-white">{p.professionalId.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            /book/{p.professionalId.bookingSlug}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {formatINR(p.amount)}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                          {p.paymentMethod}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {p.paymentMode === 'PAY_AT_CLINIC' ? 'In Clinic' : 'Online'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400 text-[11px]">
                      {new Date(p.createdAt).toLocaleString('en-IN')}
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
    </div>
  );
}
