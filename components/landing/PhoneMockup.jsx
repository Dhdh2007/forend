"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import SignalPulse from "@/components/SignalPulse";

/**
 * PhoneMockup3D
 * -----------------------------------------------------------------------
 * A CSS-3D (perspective + rotateX/rotateY) phone frame that gently tilts
 * toward the cursor. Inside it, we stage the product's entire value
 * proposition as one frozen frame: a comment containing the trigger word
 * "PRICE", with a signal pulse on it, and an outgoing DM bubble already
 * sliding in below — cause and effect, visible at a glance, no copy
 * required to explain what the product does.
 * -----------------------------------------------------------------------
 */
export default function PhoneMockup3D() {
  const ref = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  function handleMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: py * -10, y: px * 14 });
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 });
  }

  return (
    <div className="perspective-container">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="preserve-3d relative w-[300px] sm:w-[340px] rounded-[2.5rem] border border-base-border bg-base-surface/80 shadow-glow p-3 backdrop-blur"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Phone notch */}
        <div className="mx-auto mb-3 h-5 w-24 rounded-full bg-base" />

        {/* Screen */}
        <div className="rounded-[1.8rem] bg-gradient-to-b from-base to-[#0A0D13] p-4 h-[500px] flex flex-col">
          <div className="flex items-center gap-2 pb-3 border-b border-base-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-signal to-signal-dim" />
            <div>
              <p className="text-sm font-semibold text-ink">yourbrand</p>
              <p className="text-xs text-ink-faint">Post · 2m ago</p>
            </div>
          </div>

          {/* Comment thread */}
          <div className="flex-1 pt-4 space-y-3">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-base-raised shrink-0" />
              <div className="bg-base-raised rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-ink-muted">
                omg need this, how much?? 😍
              </div>
            </div>

            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-base-raised shrink-0" />
              <div className="relative bg-base-raised rounded-2xl rounded-tl-sm px-3 py-2 text-sm">
                <span className="text-ink-muted">drop the </span>
                <span className="relative inline-flex items-center gap-1 rounded-md bg-signal/15 px-1.5 py-0.5 font-mono text-signal-soft font-medium">
                  PRICE
                  <span className="absolute -right-1 -top-1">
                    <SignalPulse size="sm" />
                  </span>
                </span>
                <span className="text-ink-muted"> here 🙋</span>
              </div>
            </div>
          </div>

          {/* Outgoing DM, staged as "already sent" to show cause -> effect */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-3 rounded-2xl border border-signal/30 bg-signal/10 px-3 py-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <SignalPulse size="sm" color="success" />
              <p className="text-[11px] uppercase tracking-wide text-success font-mono">
                DM sent automatically
              </p>
            </div>
            <p className="text-sm text-ink">
              Hey! Here's the link you asked about →{" "}
              <span className="text-signal-soft underline underline-offset-2">
                yourshop.com/pricing
              </span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
