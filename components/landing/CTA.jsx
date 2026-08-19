"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Radio, ArrowRight } from "lucide-react";
import SignalPulse from "@/components/SignalPulse";

export function CTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-base-border bg-gradient-to-br from-base-surface to-base p-14 text-center"
      >
        <div className="mb-5 flex justify-center">
          <SignalPulse size="lg" />
        </div>
        <h2 className="mx-auto max-w-lg font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Your next comment could already be a customer.
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-ink-muted">
          Set up your first trigger word in under two minutes.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-signal px-6 py-3.5 text-sm font-medium text-white shadow-glow transition hover:bg-signal-soft"
        >
          Get started free
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto max-w-6xl border-t border-base-border px-6 py-10">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-signal/15 text-signal">
            <Radio size={13} />
          </div>
          <span className="font-display text-sm font-semibold text-ink">
            DM Trigger Bot
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-ink-faint">
          <Link href="/privacy" className="transition hover:text-ink">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-ink">
            Terms of Service
          </Link>
          <Link href="/data-deletion" className="transition hover:text-ink">
            Data Deletion
          </Link>
          <a href="mailto:support@dmtriggerbot.app" className="transition hover:text-ink">
            Contact
          </a>
        </nav>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-base-border pt-6 sm:flex-row">
        <p className="font-mono text-xs text-ink-faint" suppressHydrationWarning>
          © {year} DM Trigger Bot. All rights reserved.
        </p>
        <p className="font-mono text-xs text-ink-faint">
          built for creators who reply too slowly
        </p>
      </div>
    </footer>
  );
}
