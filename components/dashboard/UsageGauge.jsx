"use client";

import { motion } from "framer-motion";

/**
 * UsageGauge
 * -----------------------------------------------------------------------
 * A hand-drawn SVG radial gauge rather than a chart-library donut — this
 * number (DMs used / 100 limit) is the single most consequential stat in
 * the whole app (it's what flips the backend's 403 in main.py), so it
 * gets a bespoke, larger treatment instead of blending in as one more
 * recharts widget.
 * -----------------------------------------------------------------------
 */
export default function UsageGauge({ used, limit }) {
  const pct = Math.min(used / limit, 1);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const isNearLimit = pct >= 0.85;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-base-border bg-base-surface p-6 shadow-card">
      <p className="mb-4 self-start font-mono text-xs uppercase tracking-wide text-ink-faint">
        Free tier usage
      </p>

      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#1C2432"
            strokeWidth="14"
          />
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={isNearLimit ? "#F5A65B" : "#8B7FFF"}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            transform="rotate(-90 90 90)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-semibold text-ink">
            {used}
          </span>
          <span className="font-mono text-xs text-ink-faint">/ {limit} DMs</span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-ink-muted">
        {isNearLimit
          ? `Only ${limit - used} DMs left — triggers pause automatically at the limit.`
          : `${limit - used} DMs remaining this cycle.`}
      </p>
    </div>
  );
}
