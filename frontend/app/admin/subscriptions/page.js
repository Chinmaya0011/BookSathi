'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Edit3,
  X,
  Sparkles,
  Tag,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import { formatINR, formatDisplayDate, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Plan Edit Modal
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    finalPrice: 0,
    baseMonthlyRate: 0,
    discountPercent: 0,
    badge: '',
    isPopular: false,
    isActive: true,
  });
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getSubscriptions({
        status: statusFilter || undefined,
        page,
        limit: 15,
      });
      setSubscriptions(res.data?.subscriptions || []);
      setPricingPlans(res.data?.pricingPlans || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load subscriptions and plans');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleOpenEditPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      finalPrice: plan.finalPrice || 0,
      baseMonthlyRate: plan.baseMonthlyRate || 0,
      discountPercent: plan.discountPercent || 0,
      badge: plan.badge || '',
      isPopular: plan.isPopular || false,
      isActive: plan.isActive ?? true,
    });
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    if (e) e.preventDefault();
    if (!selectedPlan) return;
    setUpdatingPlan(true);
    try {
      await adminService.updatePricingPlan(selectedPlan._id, planForm);
      toast.success(`Pricing plan ${selectedPlan.title} updated successfully!`);
      setPlanModalOpen(false);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update pricing plan');
    } finally {
      setUpdatingPlan(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>SaaS Monetization</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Subscriptions & SaaS Pricing Plans
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage platform membership tiers, pricing rates, promotional discounts, and subscriber renewals.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchSubscriptions}
          className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Plans
        </Button>
      </div>

      {/* Pricing Plan Cards Configuration */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-400" />
          <span>Active SaaS Pricing Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pricingPlans.map((plan) => (
            <div
              key={plan._id}
              className={cn(
                'p-5 rounded-3xl border transition-all flex flex-col justify-between bg-slate-900',
                plan.isPopular ? 'border-purple-500/80 shadow-lg shadow-purple-500/10' : 'border-slate-800'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{plan.planKey}</span>
                  {plan.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white">{plan.title}</h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">{formatINR(plan.finalPrice)}</span>
                  <span className="text-[10px] text-slate-400">
                    / {plan.durationMonths > 0 ? `${plan.durationMonths} Mo` : 'Lifetime'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  Base rate: {formatINR(plan.baseMonthlyRate)}/mo {plan.discountPercent > 0 && `(Save ${plan.discountPercent}%)`}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    plan.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  )}
                >
                  {plan.isActive ? 'Live in Checkout' : 'Disabled'}
                </span>

                <Button
                  size="sm"
                  onClick={() => handleOpenEditPlan(plan)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit Plan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Active Platform Subscribers</span>
          </h3>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="">All Subscription Statuses</option>
            <option value="ACTIVE">Active Subscriptions</option>
            <option value="EXPIRED">Expired Subscriptions</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Professional</th>
                  <th className="py-3.5 px-4">Plan Subscribed</th>
                  <th className="py-3.5 px-4">Starts At</th>
                  <th className="py-3.5 px-4">Expires At</th>
                  <th className="py-3.5 px-4">Price Paid</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <RotateCcw className="w-6 h-6 animate-spin mx-auto text-purple-500 mb-2" />
                      <span>Loading active subscriptions...</span>
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No subscriptions match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{sub.professionalId?.name || 'Professional'}</div>
                        <div className="text-[11px] text-slate-400">
                          {sub.professionalId?.profession} • {sub.userId?.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-purple-300">
                        {sub.planTitle || sub.planKey}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {formatDisplayDate(sub.startsAt)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {formatDisplayDate(sub.expiresAt)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {formatINR(sub.pricing?.finalPayableAmount || 0)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider',
                            sub.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          )}
                        >
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {planModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Plan: {selectedPlan.title}</h3>
                <p className="text-xs text-slate-400">Key: {selectedPlan.planKey}</p>
              </div>
              <button onClick={() => setPlanModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Final Payable Price (₹)</label>
                  <input
                    type="number"
                    value={planForm.finalPrice}
                    onChange={(e) => setPlanForm({ ...planForm, finalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Base Monthly Rate (₹)</label>
                  <input
                    type="number"
                    value={planForm.baseMonthlyRate}
                    onChange={(e) => setPlanForm({ ...planForm, baseMonthlyRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Discount Percent (%)</label>
                  <input
                    type="number"
                    value={planForm.discountPercent}
                    onChange={(e) => setPlanForm({ ...planForm, discountPercent: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Promotional Badge</label>
                  <input
                    type="text"
                    value={planForm.badge}
                    placeholder="e.g. ⭐ Most Popular"
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.isPopular}
                    onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-slate-300 font-semibold">Highlight as Popular Tier</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-slate-300 font-semibold">Active in Onboarding</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPlanModalOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={updatingPlan} className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                  Save Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
