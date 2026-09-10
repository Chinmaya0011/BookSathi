'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Lock,
  Unlock,
  KeyRound,
  Edit,
  X,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { formatDisplayDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit / Password Reset Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('PROFESSIONAL');
  const [editActive, setEditActive] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);
  const [modalError, setModalError] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, [roleFilter, page]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getUsers({
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        page,
        limit: 15,
      });

      setUsers(res.data?.users || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditActive(user.isActive !== false);
    setNewPassword('');
    setModalError('');
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmittingUser(true);
    setModalError('');
    try {
      await adminService.updateUser(selectedUser._id, {
        role: editRole,
        isActive: editActive,
        newPassword: newPassword.trim() || undefined,
      });
      setSelectedUser(null);
      showToast('User account updated successfully');
      loadUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmittingUser(false);
    }
  };

  const toggleLock = async (user) => {
    try {
      await adminService.updateUser(user._id, {
        isActive: !user.isActive,
      });
      showToast(`${user.email} is now ${!user.isActive ? 'ACTIVE' : 'LOCKED'}`);
      loadUsers();
    } catch (err) {
      showToast('Failed to change user status');
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
            User Accounts & RBAC Access Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grant administrative privileges, lock/unlock accounts, and reset credentials.
          </p>
        </div>

        <Button
          onClick={loadUsers}
          variant="outline"
          className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-bold"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 focus:outline-none"
        >
          <option value="">All Account Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="PROFESSIONAL">PROFESSIONAL</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RotateCcw className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-xs font-semibold">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No user accounts found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Account Email</th>
                  <th className="px-6 py-4">Role / Permissions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-white">{u.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{u._id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Locked / Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDisplayDate(new Date(u.createdAt).toISOString().slice(0, 10))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => openUserModal(u)}
                          className="text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 p-2 rounded-xl text-xs font-bold"
                          title="Edit Role / Password"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Manage
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => toggleLock(u)}
                          className={`p-2 rounded-xl text-xs font-bold ${
                            u.isActive
                              ? 'text-rose-400 hover:bg-rose-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={u.isActive ? 'Lock Account' : 'Unlock Account'}
                        >
                          {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                      </div>
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

      {/* User Edit & Role Escalation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Manage User Access</h3>
                <p className="text-[11px] font-mono text-slate-400">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs font-semibold text-rose-300">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Account Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="PROFESSIONAL">PROFESSIONAL (Doctor / Consultant)</option>
                  <option value="ADMIN">ADMIN (Full Platform Control)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Account Active Status</label>
                <select
                  value={editActive ? 'true' : 'false'}
                  onChange={(e) => setEditActive(e.target.value === 'true')}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="true">ACTIVE (Allowed to login)</option>
                  <option value="false">LOCKED / SUSPENDED (Login disabled)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Reset Password (Leave blank to keep current)
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingUser}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  {submittingUser ? 'Saving...' : 'Save User Access'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
