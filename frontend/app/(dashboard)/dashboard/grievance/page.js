'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  LifeBuoy,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquareWarning,
  RefreshCw,
  Send,
  FileText,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { grievanceService } from '@/services/grievance.service';
import { formatDisplayDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const CATEGORIES = [
  { value: 'PAYMENT_REFUND', label: 'Payment & Payout Dispute' },
  { value: 'APPOINTMENT_SCHEDULE', label: 'Appointment & Slot Conflict' },
  { value: 'TECHNICAL_GLITCH', label: 'Technical / Booking Link Bug' },
  { value: 'PROFILE_VERIFICATION', label: 'Profile & Verification Query' },
  { value: 'BILLING_INVOICE', label: 'Billing & Invoice Request' },
  { value: 'STAFF_BEHAVIOR', label: 'Client / Staff Dispute' },
  { value: 'OTHER', label: 'General Inquiry / Other' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low - General inquiry', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: 'Medium - Standard issue', color: 'bg-blue-50 text-blue-700' },
  { value: 'HIGH', label: 'High - Affecting active bookings', color: 'bg-amber-50 text-amber-700' },
  { value: 'URGENT', label: 'Urgent - Critical blocker', color: 'bg-rose-50 text-rose-700' },
];

export default function ProfessionalGrievancePage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'list'
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    name: profile?.name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    category: 'TECHNICAL_GLITCH',
    priority: 'MEDIUM',
    subject: '',
    description: '',
    referenceCode: '',
    userType: 'PROFESSIONAL',
  });

  useEffect(() => {
    if (profile?.name && !form.name) {
      setForm((prev) => ({
        ...prev,
        name: profile.name,
        email: user?.email || '',
        phone: profile.phone || '',
      }));
    }
    loadMyGrievances();
  }, [profile, user]);

  const loadMyGrievances = async () => {
    setLoading(true);
    try {
      const res = await grievanceService.getMyGrievances();
      setGrievances(res.data || []);
    } catch (e) {
      console.error('Error fetching grievances:', e);
      toast.error('Failed to load your grievance tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTicket = (ticketId) => {
    navigator.clipboard.writeText(ticketId);
    setCopiedId(ticketId);
    toast.success(`Ticket #${ticketId} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.warning('Please fill in both Subject and Detailed Description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await grievanceService.submitGrievance(form);
      toast.success(`Grievance #${res.data?.ticketId} registered! Admin has been notified.`);
      setForm({
        name: profile?.name || '',
        email: user?.email || '',
        phone: profile?.phone || '',
        category: 'TECHNICAL_GLITCH',
        priority: 'MEDIUM',
        subject: '',
        description: '',
        referenceCode: '',
        userType: 'PROFESSIONAL',
      });
      await loadMyGrievances();
      setActiveTab('list');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Open / Pending Review</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Under Investigation</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved by Admin</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-500/10 text-rose-600 border border-rose-200">Urgent</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-200">High</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-600 border border-indigo-200">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-600">Low</span>;
    }
  };

  return (
    <div className="space-y-6 w-full pb-12 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-indigo-200 border border-white/15 mb-3">
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Practitioner Support & Grievance Redressal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Grievance & Issue Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Report payment mismatches, booking anomalies, platform bugs, or verification queries directly to the BookSaathi Admin Team.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex items-center p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Lodge Grievance</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Tickets ({grievances.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Lodge Grievance Form */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-indigo-600" />
              <span>Submit Issue or Dispute Ticket</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please provide complete details so the admin team can investigate and resolve your request rapidly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Issue Category & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Issue Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Severity / Urgency Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Subject & Reference Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <Input
                  label="Subject Line"
                  required
                  placeholder="e.g. UPI Payment received but appointment status remains Pending"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Related Code / Reference (Optional)"
                  placeholder="e.g. #BK-9182 or TXN-5432"
                  value={form.referenceCode}
                  onChange={(e) => setForm({ ...form, referenceCode: e.target.value })}
                />
              </div>
            </div>

            {/* Row 3: Detailed Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Detailed Description & Context <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Explain the issue clearly: what happened, date and time, affected client or transaction, and expected resolution..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Max 3000 characters. Please avoid sharing sensitive passwords.
              </p>
            </div>

            {/* Contact Confirmation Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Admin reply will be dispatched to your registered email: <strong>{user?.email}</strong>
                </span>
              </div>
              <span className="text-indigo-600 font-bold">Standard SLA: 24 Hours</span>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                size="md"
                loading={submitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
              >
                <Send className="w-4 h-4 mr-1.5" /> Submit Grievance Ticket
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: My Submitted Tickets List */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Submitted Grievance History</h2>
              <p className="text-xs text-slate-500">Track real-time status and administrative responses</p>
            </div>

            <button
              onClick={loadMyGrievances}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title="Refresh tickets"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-16 flex justify-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : grievances.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {grievances.map((item) => (
                <div key={item._id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                  {/* Top Bar: Ticket ID, Date, Priority, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleCopyTicket(item.ticketId)}
                        className="inline-flex items-center gap-1 font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        title="Click to copy Ticket ID"
                      >
                        {copiedId === item.ticketId ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-indigo-500" />
                        )}
                        <span>{item.ticketId}</span>
                      </button>

                      <span className="text-xs font-semibold text-slate-500">
                        {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Subject & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.subject}</h3>
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                      {item.description}
                    </p>
                    {item.referenceCode && (
                      <p className="text-[11px] text-slate-500 mt-2 font-mono">
                        Reference Code: <span className="font-bold text-slate-700">{item.referenceCode}</span>
                      </p>
                    )}
                  </div>

                  {/* Admin Resolution / Response Box (If present) */}
                  {item.adminResponse && (
                    <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-2 font-bold text-indigo-900">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Official Administrator Resolution Response</span>
                        {item.resolvedAt && (
                          <span className="text-[10px] font-normal text-indigo-600">
                            • {new Date(item.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-indigo-900/90 pl-6">
                        {item.adminResponse}
                      </p>
                    </div>
                  )}

                  {/* Footer Timestamps */}
                  <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>
                      Submitted on{' '}
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-slate-400">User Type: Professional</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center">
              <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No grievances submitted</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't filed any support or dispute tickets. If you ever encounter any issues, lodge a ticket here for priority resolution.
              </p>
              <div className="mt-4">
                <Button size="sm" onClick={() => setActiveTab('create')}>
                  <PlusCircle className="w-4 h-4 mr-1.5" /> Submit First Ticket
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
