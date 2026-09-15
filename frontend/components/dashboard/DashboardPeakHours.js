'use client';

import {
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPeakHours({ hourlyDistribution }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 font-sans">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 truncate">Peak Slot Demand</h3>
      </div>
      <p className="text-[11px] sm:text-xs text-slate-500 mb-3">
        Hourly booking distribution pattern
      </p>

      <div className="h-44 w-full">
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
  );
}
