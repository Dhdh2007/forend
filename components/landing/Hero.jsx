"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import AmbientGlow from "./AmbientGlow";
import PhoneMockup3D from "./PhoneMockup";

export default function Hero({ isLoggedIn }) {
  return (
    <section className="relative overflow-hidden">
      <AmbientGlow />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-28 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-base-border bg-base-surface/60 px-3 py-1.5 text-xs text-ink-muted backdrop-blur"
          >
            <Zap size={13} className="text-alert" />
            Listening on every comment, 24/7
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl"
          >
            Turn comments into
            <br />
            <span className="bg-gradient-to-r from-signal to-signal-soft bg-clip-text text-transparent">
              conversations.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted"
          >
            Pick a trigger word. The moment someone comments it, they get an
            instant DM with your link — no manual replying, no missed leads.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="group inline-flex items-center gap-2 rounded-lg bg-signal px-6 py-3.5 text-sm font-medium text-white shadow-glow transition hover:bg-signal-soft"
            >
              Set up your first trigger
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
            <p className="font-mono text-xs text-ink-faint">
              Free for your first 100 DMs · no card required
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="animate-float-slow">
            <PhoneMockup3D />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
