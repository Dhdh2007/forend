"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-base-border bg-base-raised px-3 py-2 shadow-card">
      <p className="mb-0.5 font-mono text-[11px] text-ink-faint">{label}</p>
      <p className="font-mono text-sm font-medium text-signal-soft">
        {payload[0].value} DMs sent
      </p>
    </div>
  );
}

export default function DMTrendChart({ data }) {
  return (
    <div className="rounded-2xl border border-base-border bg-base-surface p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            DMs sent this week
          </h3>
          <p className="text-xs text-ink-faint">Across all active triggers</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B7FFF" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#8B7FFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1C2432" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8B93A7", fontSize: 12, fontFamily: "var(--font-mono)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8B93A7", fontSize: 12, fontFamily: "var(--font-mono)" }}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#262E3D" }} />
          <Area
            type="monotone"
            dataKey="sent"
            stroke="#8B7FFF"
            strokeWidth={2.5}
            fill="url(#sentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
