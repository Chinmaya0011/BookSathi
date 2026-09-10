'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  LifeBuoy,
  Send,
  CalendarCheck,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Mail,
  User,
  MessageSquareWarning,
  Sparkles,
} from 'lucide-react';
import { grievanceService } from '@/services/grievance.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const CATEGORIES = [
  { value: 'APPOINTMENT_SCHEDULE', label: 'Appointment Booking / Rescheduling Issue' },
  { value: 'PAYMENT_REFUND', label: 'Payment & Refund Inquiry' },
  { value: 'TECHNICAL_GLITCH', label: 'Website / OTP / Verification Glitch' },
  { value: 'STAFF_BEHAVIOR', label: 'Practitioner / Consultation Feedback' },
  { value: 'OTHER', label: 'General Inquiry / Other' },
];

export default function CustomerSupportPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'APPOINTMENT_SCHEDULE',
    priority: 'MEDIUM',
    subject: '',
    description: '',
    referenceCode: '',
    userType: 'CUSTOMER',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.description.trim()) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await grievanceService.submitGrievance(form);
      setSubmittedTicket(res.data);
      toast.success('Your grievance has been registered successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/20">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <span className="text-base font-black text-slate-900 tracking-tight">
            Book<span className="text-indigo-600">Saathi</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Support Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-indigo-200 border border-white/15">
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Customer Help & Grievance Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              How can we assist you?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Have an issue with your appointment, payment confirmation, or booking experience? Submit a grievance ticket and our support admins will resolve it.
            </p>
          </div>
        </div>

        {/* Success Confirmation or Form */}
        {submittedTicket ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-black text-slate-900">Grievance Registered Successfully!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your ticket has been assigned to our administration team. A confirmation has been sent to{' '}
              <strong>{submittedTicket.email}</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 inline-block font-mono text-xs font-bold text-indigo-900">
              Ticket ID: <span className="text-indigo-600">{submittedTicket.ticketId}</span>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmittedTicket(null);
                  setForm({
                    name: '',
                    email: '',
                    phone: '',
                    category: 'APPOINTMENT_SCHEDULE',
                    priority: 'MEDIUM',
                    subject: '',
                    description: '',
                    referenceCode: '',
                    userType: 'CUSTOMER',
                  });
                }}
              >
                Submit Another Request
              </Button>
              <Link href="/">
                <Button size="sm">Return to Home</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-indigo-600" />
                <span>Submit a Complaint or Grievance</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Our support team typically responds within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  required
                  placeholder="e.g. Anjali Verma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  prefix={<User className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="anjali@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  prefix={<Mail className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number (Optional)"
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  prefix={<Phone className="w-4 h-4 text-slate-400" />}
                />

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Subject"
                    required
                    placeholder="Briefly state your problem"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>

                <div>
                  <Input
                    label="Appointment Code (If any)"
                    placeholder="e.g. #BK-1092"
                    value={form.referenceCode}
                    onChange={(e) => setForm({ ...form, referenceCode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Detailed Explanation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe what occurred, including dates, consultation fee, doctor name, and how we can best assist you..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" size="md" loading={submitting}>
                  <Send className="w-4 h-4 mr-1.5" /> Submit Support Request
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
