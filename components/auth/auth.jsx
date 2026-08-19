'use client'
import {motion} from 'framer-motion'
export default function AuthCard({ eyebrow, title, subtitle, children, footer }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#131622]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_60px_-15px_rgba(124,92,252,0.35)]"
      >
        {eyebrow && (
          <p className="text-xs tracking-[0.2em] uppercase text-[#3ED9C4] font-mono mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-semibold text-[#E7E9F0] mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-[#8890A6] mb-6">{subtitle}</p>}
        {children}
        {footer && <div className="mt-6 text-sm text-[#8890A6]">{footer}</div>}
      </motion.div>
    )
  }
  