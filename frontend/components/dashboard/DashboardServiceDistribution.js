'use client';

import {
  PieChart as PieIcon,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

export default function DashboardServiceDistribution({ serviceDistribution, loading }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 flex flex-col justify-between min-w-0 w-full overflow-hidden">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <PieIcon className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">Service Distribution</h3>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-500 mb-3 truncate">
          Consultation volume share across services
        </p>

        <div className="h-44 w-full relative">
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
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={4}
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
      </div>

      {/* Service Legend Bars */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100 mt-2">
        {(serviceDistribution || []).slice(0, 4).map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate max-w-[170px]">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="font-semibold text-slate-700 truncate">{item.name}</span>
              </div>
              <span className="font-bold text-slate-900 shrink-0">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            {/* Mini progress bar */}
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
  );
}
