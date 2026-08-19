"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * StatCard
 * -----------------------------------------------------------------------
 * Same perspective-tilt technique as the hero phone, dialed way down
 * (max ~6deg) so it reads as "responsive surface" rather than a gimmick
 * on a data-dense dashboard. Depth is used sparingly here on purpose —
 * the hero earns the bigger effect, the dashboard just gets a hint of it.
 * -----------------------------------------------------------------------
 */
export default function StatCard({ label, value, unit, delta, icon: Icon, accent = "signal" }) {
  const ref = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  function handleMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: py * -6, y: px * 8 });
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 });
  }

  const accentClasses = {
    signal: "bg-signal/15 text-signal",
    success: "bg-success/15 text-success",
    alert: "bg-alert/15 text-alert",
  };

  return (
    <div className="perspective-container">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: "spring", stiffness: 150, damping: 16 }}
        style={{ transformStyle: "preserve-3d" }}
        className="rounded-2xl border border-base-border bg-base-surface p-6 shadow-card"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
            <Icon size={17} />
          </div>
          {delta && (
            <span className="font-mono text-xs text-success">{delta}</span>
          )}
        </div>
        <p className="mb-1 font-mono text-3xl font-semibold text-ink">
          {value}
          {unit && <span className="ml-1 text-base text-ink-faint">{unit}</span>}
        </p>
        <p className="text-sm text-ink-muted">{label}</p>
      </motion.div>
    </div>
  );
}
