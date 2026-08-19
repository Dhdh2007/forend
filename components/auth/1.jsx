'use client'

import { motion } from 'framer-motion'

const FEATURES = [
  { label: 'Rate-limited', desc: '100 free DMs per user, enforced server-side with race-safe counters.' },
  { label: 'JWT verified', desc: 'Every backend request checked against a signed Supabase session token.' },
  { label: 'Built for scale', desc: 'FastAPI backend designed to handle concurrent sends safely.' },
]

// This is the section the user scrolls down into — each block fades/slides
// up "whileInView", once, so it doesn't replay every time you scroll past it.
export default function FeatureStrip() {
  return (
    <section className="border-t border-white/10 bg-[#0B0D14] px-6 py-20">
      <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <p className="font-mono text-xs text-[#3ED9C4] uppercase tracking-[0.2em] mb-2">{f.label}</p>
            <p className="text-[#8890A6] text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
