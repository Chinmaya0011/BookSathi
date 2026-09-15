'use client';

import { useState } from 'react';
import {
  PieChart as PieIcon,
  Clock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

export default function DashboardServiceDistribution({
  serviceDistribution = [],
  hourlyDistribution = [],
  loading,
}) {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'peak'

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between min-w-0 w-full overflow-hidden font-sans h-full">
      <div className="min-w-0">
        {/* Header with Switcher Tabs */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0',
                activeTab === 'services'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-purple-50 text-purple-600'
              )}
            >
              {activeTab === 'services' ? (
                <PieIcon className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {activeTab === 'services' ? 'Service Distribution' : 'Peak Slot Demand'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {activeTab === 'services' ? 'Volume breakdown by treatment' : 'Hourly booking pattern'}
              </p>
            </div>
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg shrink-0 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={cn(
                'px-2 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                activeTab === 'services'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('peak')}
              className={cn(
                'px-2 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                activeTab === 'peak'
                  ? 'bg-white text-purple-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              Peak Hours
            </button>
          </div>
        </div>

        {/* Tab 1: Service Distribution Pie */}
        {activeTab === 'services' && (
          <div>
            <div className="h-40 w-full relative">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                </div>
              ) : serviceDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={62}
                      paddingAngle={3}
                    >
                      {serviceDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          strokeWidth={2}
                          stroke="#ffffff"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, item) => [
                        `${val} sessions (${item.payload.percentage}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No service data recorded yet
                </div>
              )}
            </div>

            {/* Service Legend Bars */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 mt-2">
              {(serviceDistribution || []).slice(0, 3).map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="font-medium text-slate-700 truncate text-[11px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0 text-[10px]">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Peak Hours Distribution Bar */}
        {activeTab === 'peak' && (
          <div>
            <div className="h-48 sm:h-52 w-full">
              {hourlyDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hourlyDistribution}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 9, fill: '#64748b', fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No hourly data recorded yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
