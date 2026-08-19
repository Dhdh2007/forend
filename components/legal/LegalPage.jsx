"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function LegalSection({ title, children }) {
  return (
    <motion.section variants={item}>
      <h2 className="mb-2 font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </motion.section>
  );
}

export default function LegalPage({ title, lastUpdated, children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-base px-6 py-20 text-ink">
      {/* Soft ambient glow, matching the landing page's visual language */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-signal/30 blur-[120px]"
      />

      <div className="relative mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
          >
            <ArrowLeft size={12} />
            Back home
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 text-sm text-ink-faint"
          suppressHydrationWarning
        >
          Last updated: {lastUpdated}
        </motion.p>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-10 space-y-8"
        >
          {children}
        </motion.div>
      </div>
    </main>
  );
}
