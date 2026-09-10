'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  LifeBuoy,
  AlertCircle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  MessageSquareWarning,
  User,
  Mail,
  Phone,
  Tag,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  Send,
  X,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { grievanceService } from '@/services/grievance.service';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

const CATEGORIES = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'PAYMENT_REFUND', label: 'Payment & Refund' },
  { value: 'APPOINTMENT_SCHEDULE', label: 'Appointment & Schedule' },
  { value: 'TECHNICAL_GLITCH', label: 'Technical & Platform Bug' },
  { value: 'PROFILE_VERIFICATION', label: 'Profile Verification' },
  { value: 'BILLING_INVOICE', label: 'Billing & Invoice' },
  { value: 'STAFF_BEHAVIOR', label: 'Client / Staff Dispute' },
  { value: 'OTHER', label: 'Other Inquiries' },
];

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [userTypeFilter, setUserTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review & Resolution Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editStatus, setEditStatus] = useState('OPEN');
  const [editResponse, setEditResponse] = useState('');
  const [updating, setUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadData();
  }, [statusFilter, userTypeFilter, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        grievanceService.getAllGrievances({
          status: statusFilter,
          userType: userTypeFilter,
          category: categoryFilter,
          search: searchQuery,
        }),
        grievanceService.getGrievanceStats(),
      ]);

      setGrievances(listRes.data?.grievances || []);
      setStats(statsRes.data || null);
    } catch (e) {
      console.error('Error loading grievances:', e);
      toast.error('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleCopyTicket = (ticketId) => {
    navigator.clipboard.writeText(ticketId);
    setCopiedId(ticketId);
    toast.success(`Ticket #${ticketId} copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openReviewModal = (ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditResponse(ticket.adminResponse || '');
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setUpdating(true);
    try {
      await grievanceService.updateGrievanceStatus(selectedTicket._id, {
        status: editStatus,
        adminResponse: editResponse,
      });

      toast.success(`Ticket #${selectedTicket.ticketId} updated successfully!`);
      setSelectedTicket(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Open</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">In Progress</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Resolved</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700 text-slate-300 border border-slate-600">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">Urgent</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">High</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-800 text-slate-400">Low</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Grievance & Dispute Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Grievances & Support Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Resolve issues, technical disputes, payment reconciliations, and feedback raised by doctors, consultants, and clients.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Tickets
          </span>
          <span className="text-3xl font-black text-white mt-2 block">
            {stats?.total || 0}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">All time complaints</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Open / Pending
            </span>
            {stats?.urgentCount > 0 && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                {stats.urgentCount} Urgent
              </span>
            )}
          </div>
          <span className="text-3xl font-black text-amber-400 mt-2 block">
            {stats?.openCount || 0}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Awaiting admin review</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-3xl border border-blue-500/30">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
            In Progress
          </span>
          <span className="text-3xl font-black text-blue-400 mt-2 block">
            {stats?.inProgressCount || 0}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Under investigation</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-3xl border border-emerald-500/30">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            Resolved
          </span>
          <span className="text-3xl font-black text-emerald-400 mt-2 block">
            {stats?.resolvedCount || 0}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Successfully closed</span>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tab Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            {[
              { key: 'ALL', label: 'All Statuses' },
              { key: 'OPEN', label: 'Open' },
              { key: 'IN_PROGRESS', label: 'In Progress' },
              { key: 'RESOLVED', label: 'Resolved' },
              { key: 'CLOSED', label: 'Closed' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === tab.key
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* User Type Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
            {[
              { key: 'ALL', label: 'All Users' },
              { key: 'PROFESSIONAL', label: 'Doctors / Pros' },
              { key: 'CUSTOMER', label: 'Customers' },
            ].map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setUserTypeFilter(type.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userTypeFilter === type.key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category filter & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Ticket ID, Complainant, or Subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </form>
        </div>
      </div>

      {/* Tickets Table / List */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex justify-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        ) : grievances.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {grievances.map((item) => (
              <div
                key={item._id}
                className="p-5 sm:p-6 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side: Ticket Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopyTicket(item.ticketId)}
                      className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors inline-flex items-center gap-1"
                    >
                      {copiedId === item.ticketId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{item.ticketId}</span>
                    </button>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        item.userType === 'PROFESSIONAL'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.userType}
                    </span>

                    {getPriorityBadge(item.priority)}
                    {getStatusBadge(item.status)}

                    <span className="text-xs text-slate-400 font-semibold">
                      {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{item.subject}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span>
                      Complainant: <strong className="text-slate-200">{item.name}</strong> ({item.email}
                      {item.phone ? ` • ${item.phone}` : ''})
                    </span>
                    {item.referenceCode && (
                      <span className="font-mono text-slate-400">
                        Ref: <strong className="text-slate-200">{item.referenceCode}</strong>
                      </span>
                    )}
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Right side: Action Button */}
                <div className="shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => openReviewModal(item)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold border border-slate-700 hover:border-rose-500 transition-all shadow-md inline-flex items-center gap-1.5"
                  >
                    <span>Review & Resolve</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400">
            <LifeBuoy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No grievances matching filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No dispute or support tickets found for your current filter and search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Review & Resolution Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket #${selectedTicket.ticketId} - Review & Resolution`}
        >
          <form onSubmit={handleSaveResolution} className="space-y-5 text-slate-900">
            {/* User Meta Card */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{selectedTicket.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                  {selectedTicket.userType}
                </span>
              </div>
              <p className="text-slate-600">
                Email: <strong>{selectedTicket.email}</strong> {selectedTicket.phone ? ` • Tel: ${selectedTicket.phone}` : ''}
              </p>
              {selectedTicket.referenceCode && (
                <p className="font-mono text-slate-600">
                  Related Code: <strong>{selectedTicket.referenceCode}</strong>
                </p>
              )}
            </div>

            {/* Subject & Description View */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject</span>
              <h4 className="text-sm font-bold text-slate-900">{selectedTicket.subject}</h4>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-40 overflow-y-auto">
                {selectedTicket.description}
              </p>
            </div>

            {/* Change Status */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Update Ticket Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="OPEN">OPEN (Pending Review)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Under Investigation)</option>
                <option value="RESOLVED">RESOLVED (Action Taken & Resolved)</option>
                <option value="CLOSED">CLOSED (Archived)</option>
              </select>
            </div>

            {/* Admin Resolution Response */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Official Administrator Resolution Note / Response
              </label>
              <textarea
                rows={4}
                placeholder="Write the official response or action taken. This will be displayed on the practitioner's portal..."
                value={editResponse}
                onChange={(e) => setEditResponse(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={updating}>
                Save & Update Ticket
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
