'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import FeatureStrip from '@/components/auth/1'

// three.js touches the real DOM/canvas, so it can't run on the server.
// dynamic(..., { ssr: false }) skips server rendering for this component only.
const Scene3D = dynamic(() => import('@/components/auth/3d'), { ssr: false })

export default function AuthLayout({ children }) {
    const [scrollProgress, setScrollProgress] = useState(0)
    const containerRef = useRef(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const onScroll = () => {
            const max = el.scrollHeight - el.clientHeight
            setScrollProgress(max > 0 ? el.scrollTop / max : 0)
        }
        el.addEventListener('scroll', onScroll)
        return () => el.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div
            ref={containerRef}
            className="h-screen overflow-y-auto bg-[#0B0D14] text-[#E7E9F0] scroll-smooth"
        >
            <section className="relative min-h-screen flex items-center justify-center px-6">
                <div className="absolute inset-0">
                    <Scene3D scrollProgress={scrollProgress} />
                </div>

                <div className="relative z-10 grid md:grid-cols-2 gap-12 max-w-5xl w-full items-center">
                    <div className="hidden md:block">
                        <p className="font-mono text-xs text-[#3ED9C4] tracking-[0.2em] uppercase mb-4">
                            DM Trigger Bot
                        </p>
                        <h2 className="text-4xl font-semibold leading-tight mb-4">
                            Every DM,<br />counted and controlled.
                        </h2>
                        <p className="text-[#8890A6] max-w-sm">
                            Sign in to manage your automated DMs, track your free-tier
                            usage, and keep your account secure with session-based auth.
                        </p>
                    </div>

                    {children}
                </div>
            </section>

            <FeatureStrip />
        </div>
    )
}