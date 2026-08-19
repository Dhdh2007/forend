"use client";

import { motion } from "framer-motion";
import { Sparkles, MousePointerClick, ShieldCheck } from "lucide-react";
import Link from "next/link";

// Replaces the pricing section on the landing page for now — the goal here
// isn't "compare plans", it's "convince a first-time visitor this is easy
// and free enough to just try right now".
const POINTS = [
  {
    icon: Sparkles,
    title: "Free to start",
    desc: "No card, no trial tricks. Your first 100 automated DMs cost nothing.",
  },
  {
    icon: MousePointerClick,
    title: "Zero code required",
    desc: "Connect your Instagram, type a trigger word, paste a link. That's the whole setup — built for creators, not developers.",
  },
  {
    icon: ShieldCheck,
    title: "Hassle-free integration",
    desc: "One click through Instagram's own login screen. No API keys to copy, no settings to configure by hand.",
  },
];

export default function EasySetup() {
  return (
    <section id="get-started" className="relative mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-signal">
          Getting started
        </p>
        <h2 className="mb-5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Free, hassle-free, and easy enough for anyone to set up.
        </h2>
        <p className="mx-auto max-w-md leading-relaxed text-ink-muted">
          No developer required. If you can post on Instagram, you can set
          up DM Trigger Bot.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {POINTS.map((point, i) => (
          <motion.div
            key={point.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl border border-base-border bg-base-surface p-8 shadow-card"
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-signal/15 text-signal">
              <point.icon size={18} />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-ink">
              {point.title}
            </h3>
            <p className="text-sm leading-relaxed text-ink-muted">{point.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-14 text-center"
      >
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-lg bg-signal px-7 py-3.5 text-sm font-medium text-white shadow-glow transition hover:bg-signal-soft"
        >
          Try it free — takes 2 minutes
        </Link>
      </motion.div>
    </section>
  );
}
