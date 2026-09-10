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
        <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl text-xs border border-slate-800 min-w-[140px]">
          <p className="font-semibold text-slate-400">{label}</p>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <span className="text-slate-300">
              {chartView === 'appointments' ? 'Bookings:' : 'Revenue:'}
            </span>
            <span className="font-black text-indigo-400 text-sm">
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
    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 flex flex-col justify-between min-w-0 w-full overflow-hidden">
      <div className="min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                7-Day Booking & Revenue Trends
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Consultation volume and earnings performance over the past week
            </p>
          </div>

          {/* Toggle Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap pt-1 sm:pt-0 shrink-0">
            {/* View Switch */}
            <div className="flex items-center p-1 bg-slate-100/90 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setChartView('appointments')}
                className={cn(
                  'px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  chartView === 'appointments'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Visits
              </button>
              <button
                type="button"
                onClick={() => setChartView('revenue')}
                className={cn(
                  'px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  chartView === 'revenue'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Revenue (₹)
              </button>
            </div>

            {/* Chart Style Switch */}
            <div className="flex items-center p-1 bg-slate-100/90 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setChartType('area')}
                className={cn(
                  'px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  chartType === 'area'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Curve
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={cn(
                  'px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  chartType === 'bar'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Bar
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary Pill above chart */}
        <div className="mb-3 sm:mb-4 flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-500 text-[11px] sm:text-xs font-medium">7-Day Total:</span>
            <span className="font-black text-slate-900 text-[11px] sm:text-xs">
              {chartView === 'appointments'
                ? `${trendTotalVolume} Appointments`
                : formatINR(trendTotalRevenue)}
            </span>
          </div>
        </div>

        <div className="h-56 sm:h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
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
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
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
                    stroke="#6366f1"
                    strokeWidth={3}
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
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
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
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
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
