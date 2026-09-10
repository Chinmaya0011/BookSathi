'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  ChevronRight,
  Edit3,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import { formatINR, formatDisplayDate, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminQrOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Edit/Ship Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    orderStatus: 'IN_PRINTING',
    trackingNumber: '',
    courierPartner: 'BlueDart / Delhivery Express',
    estimatedDeliveryDate: '',
  });
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getQrOrders({
        search: search.trim() || undefined,
        orderStatus: statusFilter || undefined,
        page,
        limit: 15,
      });
      setOrders(res.data?.orders || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load QR Kit orders');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenEdit = (order) => {
    setSelectedOrder(order);
    setOrderForm({
      orderStatus: order.orderStatus || 'ORDER_PLACED',
      trackingNumber: order.trackingNumber || '',
      courierPartner: order.courierPartner || 'BlueDart / Delhivery Express',
      estimatedDeliveryDate: order.estimatedDeliveryDate
        ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0]
        : '',
    });
    setUpdateModalOpen(true);
  };

  const handleSaveOrder = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await adminService.updateQrOrderStatus(selectedOrder._id, orderForm);
      toast.success(`Order #${selectedOrder.orderCode} updated successfully!`);
      setUpdateModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'SHIPPED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'IN_PRINTING':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'ORDER_PLACED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Fulfillment Pipeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            QR Standee & Vinyl Banner Orders
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage physical acrylic desk standees and clinic wall banner dispatches across India.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchOrders}
          className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Pipeline
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by order code, recipient name, phone, city, or tracking #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="">All Order Statuses</option>
            <option value="ORDER_PLACED">Order Placed (New)</option>
            <option value="IN_PRINTING">In Printing / Manufacturing</option>
            <option value="SHIPPED">Shipped with Courier</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Order Code</th>
                <th className="py-3.5 px-4">Professional & Practice</th>
                <th className="py-3.5 px-4">Plan & Package</th>
                <th className="py-3.5 px-4">Shipping Destination</th>
                <th className="py-3.5 px-4">Courier & Tracking</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RotateCcw className="w-6 h-6 animate-spin mx-auto text-rose-500 mb-2" />
                    <span>Loading QR fulfillment orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No QR kit orders match the selected filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {order.orderCode}
                      <span className="block text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                        {formatDisplayDate(order.createdAt)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{order.professionalId?.name || 'Professional'}</div>
                      <div className="text-[11px] text-slate-400">
                        {order.professionalId?.profession} • {order.professionalId?.phone || order.userId?.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-indigo-300">{order.planTitle}</span>
                      <span className="block text-[10px] text-slate-400">
                        {formatINR(order.pricingBreakdown?.finalPayableAmount || 0)} ({order.paymentStatus})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-200 truncate">
                        {order.shippingAddress?.recipientName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} ({order.shippingAddress?.pincode})
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {order.trackingNumber ? (
                        <div>
                          <span className="font-mono text-cyan-300 font-bold">{order.trackingNumber}</span>
                          <span className="block text-[10px] text-slate-500">{order.courierPartner}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Not Assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider',
                          getStatusBadge(order.orderStatus)
                        )}
                      >
                        {order.orderStatus?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        onClick={() => handleOpenEdit(order)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Update
                      </Button>
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
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders total)
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

      {/* Update Order Status & Shipment Modal */}
      {updateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Update Kit Fulfillment</h3>
                <p className="text-xs text-slate-400">Order #{selectedOrder.orderCode}</p>
              </div>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Manufacturing & Shipment Status</label>
                <select
                  value={orderForm.orderStatus}
                  onChange={(e) => setOrderForm({ ...orderForm, orderStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-rose-500"
                >
                  <option value="ORDER_PLACED">Order Placed (Pending Print)</option>
                  <option value="IN_PRINTING">In Printing / Acrylic Standee Fab</option>
                  <option value="SHIPPED">Shipped with Courier</option>
                  <option value="DELIVERED">Delivered to Professional</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Courier Express Partner</label>
                <input
                  type="text"
                  value={orderForm.courierPartner}
                  onChange={(e) => setOrderForm({ ...orderForm, courierPartner: e.target.value })}
                  placeholder="e.g. BlueDart Express / Delhivery / DTDC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Courier Tracking AWB / Number</label>
                <input
                  type="text"
                  value={orderForm.trackingNumber}
                  onChange={(e) => setOrderForm({ ...orderForm, trackingNumber: e.target.value })}
                  placeholder="e.g. BD9876543210IN"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={orderForm.estimatedDeliveryDate}
                  onChange={(e) => setOrderForm({ ...orderForm, estimatedDeliveryDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUpdateModalOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={updating} className="bg-rose-600 hover:bg-rose-500 text-white font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
