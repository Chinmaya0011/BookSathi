'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Edit,
  RotateCcw,
  Plus,
  X,
  Filter,
  Ban,
  IndianRupee,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { formatINR, formatDisplayDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Modal State
  const [editingProfile, setEditingProfile] = useState(null);
  const [editFee, setEditFee] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editVerified, setEditVerified] = useState(true);
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadProfessionals();
  }, [professionFilter, statusFilter, page]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadProfessionals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getProfessionals({
        search: searchTerm || undefined,
        profession: professionFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      });

      setProfessionals(res.data?.professionals || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadProfessionals();
  };

  const toggleVerification = async (profile) => {
    try {
      const updated = await adminService.updateProfessional(profile._id, {
        isVerified: !profile.isVerified,
      });
      showToast(
        `${profile.name} is now ${!profile.isVerified ? 'VERIFIED' : 'UNVERIFIED'}`
      );
      loadProfessionals();
    } catch (err) {
      showToast('Failed to update verification status');
    }
  };

  const toggleSuspend = async (profile) => {
    const newStatus = profile.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await adminService.updateProfessional(profile._id, { status: newStatus });
      showToast(`${profile.name} marked as ${newStatus}`);
      loadProfessionals();
    } catch (err) {
      showToast('Failed to change status');
    }
  };

  const openEditModal = (profile) => {
    setEditingProfile(profile);
    setEditFee(String(profile.consultationFee || 500));
    setEditSpecialization(profile.specialization || '');
    setEditVerified(profile.isVerified !== false);
    setEditStatus(profile.status || 'ACTIVE');
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProfile) return;
    setSubmittingEdit(true);
    setEditError('');
    try {
      await adminService.updateProfessional(editingProfile._id, {
        consultationFee: Number(editFee),
        specialization: editSpecialization.trim(),
        isVerified: editVerified,
        status: editStatus,
      });
      setEditingProfile(null);
      showToast('Professional updated successfully');
      loadProfessionals();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update');
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Professional Directory Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage verified badges, suspend/activate booking links, and configure doctor profiles.
          </p>
        </div>

        <Button
          onClick={loadProfessionals}
          variant="outline"
          className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-bold"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Refresh Directory
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor, phone, email, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={professionFilter}
            onChange={(e) => {
              setProfessionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="">All Professions</option>
            <option value="Doctor">Doctors</option>
            <option value="CA">Chartered Accountants (CA)</option>
            <option value="Lawyer">Lawyers</option>
            <option value="Consultant">Consultants</option>
            <option value="Trainer">Trainers / Coaches</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Profiles</option>
            <option value="SUSPENDED">Suspended Profiles</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RotateCcw className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-xs font-semibold">Loading professional directory...</p>
          </div>
        ) : professionals.length === 0 ? (
          <div className="py-20 text-center px-4">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No professionals found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Professional</th>
                  <th className="px-6 py-4">Category & Fee</th>
                  <th className="px-6 py-4">Slug & Link</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {professionals.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.profileImage ? (
                          <img
                            src={p.profileImage}
                            alt={p.name}
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow-sm shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {p.name ? p.name.charAt(0).toUpperCase() : 'Dr'}
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.email}</div>
                          <div className="text-[10px] text-slate-500">{p.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{p.profession}</div>
                      <div className="text-[11px] text-slate-400">{p.specialization || 'General'}</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                        {formatINR(p.consultationFee || 500)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/book/${p.bookingSlug}`}
                        target="_blank"
                        className="font-mono text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                      >
                        <span>/book/{p.bookingSlug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {p.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleVerification(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                          p.isVerified !== false
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{p.isVerified !== false ? 'Verified' : 'Unverified'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => openEditModal(p)}
                          className="text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 p-2 rounded-xl text-xs"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => toggleSuspend(p)}
                          className={`p-2 rounded-xl text-xs font-bold ${
                            p.status === 'SUSPENDED'
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-rose-400 hover:bg-rose-500/10'
                          }`}
                          title={p.status === 'SUSPENDED' ? 'Activate Link' : 'Suspend Link'}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
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

      {/* Admin Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Edit Professional Profile</h3>
                <p className="text-[11px] text-slate-400">{editingProfile.name}</p>
              </div>
              <button
                onClick={() => setEditingProfile(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs font-semibold text-rose-300">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Consultation Fee (₹)</label>
                <Input
                  type="number"
                  min="0"
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Specialization / Tagline</label>
                <Input
                  type="text"
                  value={editSpecialization}
                  onChange={(e) => setEditSpecialization(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                  placeholder="e.g. Senior Physician"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Verified Badge</label>
                  <select
                    value={editVerified ? 'true' : 'false'}
                    onChange={(e) => setEditVerified(e.target.value === 'true')}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="true">VERIFIED</option>
                    <option value="false">UNVERIFIED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProfile(null)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingEdit}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
