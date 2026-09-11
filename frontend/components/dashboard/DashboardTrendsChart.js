'use client';

import { useState, useMemo } from 'react';
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatINR, cn } from '@/lib/utils';

export default function DashboardTrendsChart({ weeklyTrend, loading }) {
  const [chartView, setChartView] = useState('appointments'); // 'appointments' | 'revenue'
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'

  const trendTotalVolume = useMemo(() => {
    if (!weeklyTrend) return 0;
    return weeklyTrend.reduce((acc, curr) => acc + (curr.appointments || 0), 0);
  }, [weeklyTrend]);

  const trendTotalRevenue = useMemo(() => {
    if (!weeklyTrend) return 0;
    return weeklyTrend.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  }, [weeklyTrend]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-800 min-w-[130px]">
          <p className="font-semibold text-slate-400 text-[11px]">{label}</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-slate-300">
              {chartView === 'appointments' ? 'Bookings:' : 'Revenue:'}
            </span>
            <span className="font-bold text-indigo-400 text-sm">
              {chartView === 'appointments'
                ? `${payload[0].value} visits`
                : formatINR(payload[0].value)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between min-w-0 w-full overflow-hidden">
      <div className="min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 truncate">
                Booking & Revenue Trends
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
              7-day consultation volume and earnings performance
            </p>
          </div>

          {/* Toggle Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {/* View Switch */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg shrink-0 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setChartView('appointments')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                  chartView === 'appointments'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Visits
              </button>
              <button
                type="button"
                onClick={() => setChartView('revenue')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                  chartView === 'revenue'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Revenue (₹)
              </button>
            </div>

            {/* Chart Style Switch */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg shrink-0 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setChartType('area')}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                  chartType === 'area'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Area
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                  chartType === 'bar'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Bar
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary Pill above chart */}
        <div className="mb-3 flex items-center gap-3 text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-indigo-600" />
            <span className="text-slate-500 text-[11px] font-medium">7-Day Total:</span>
            <span className="font-bold text-slate-900 text-[11px]">
              {chartView === 'appointments'
                ? `${trendTotalVolume} Appointments`
                : formatINR(trendTotalRevenue)}
            </span>
          </div>
        </div>

        <div className="h-56 sm:h-60 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          ) : weeklyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart
                  data={weeklyTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={chartView === 'appointments' ? 'appointments' : 'revenue'}
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={weeklyTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey={chartView === 'appointments' ? 'appointments' : 'revenue'}
                    fill="#4f46e5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No trend data recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
