"use client";

import { motion } from "framer-motion";
import { MessageCircle, Radar, Send } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Set a trigger word",
    body: "Choose a word like \"PRICE\" or \"GUIDE\" and the link you want to send when someone comments it.",
  },
  {
    number: "02",
    icon: Radar,
    title: "We watch every comment",
    body: "The moment a comment contains your trigger word, it's matched instantly — this is the only step that has to happen in real time.",
  },
  {
    number: "03",
    icon: Send,
    title: "Their DM arrives automatically",
    body: "No copy-pasting replies at 11pm. They get your link the second they ask for it.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-16 max-w-lg"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-signal">
          The pipeline
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Three steps, and the middle one happens in milliseconds.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative rounded-2xl border border-base-border bg-base-surface/60 p-6"
          >
            <span className="font-mono text-4xl font-semibold text-base-raised">
              {step.number}
            </span>
            <div className="mt-4 mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-signal/15 text-signal">
              <step.icon size={19} />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-ink">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-ink-muted">
              {step.body}
            </p>

            {i < steps.length - 1 && (
              <div className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-base-border to-transparent sm:block" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
