
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import AuthCard from '@/components/auth/auth'

export default function VerifyPendingPage() {
  const params = useSearchParams()
  const email = params.get('email')
  const glowRef = useRef(null)

  useEffect(() => {
    function handleMove(e) {
      if (!glowRef.current) return
      const { innerWidth, innerHeight } = window
      const x = (e.clientX / innerWidth) * 100
      const y = (e.clientY / innerHeight) * 100
      glowRef.current.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(124,92,252,0.25), transparent 60%)`
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <AuthCard
      eyebrow="Check your inbox"
      title="Verification sent"
      subtitle={email ? `We sent a link to ${email}` : 'Check your email to continue'}
      footer={
        <>
          Wrong email?{' '}
          <Link href="/signup" className="text-[#7C5CFC] hover:underline">Start over</Link>
        </>
      }
    >
      <div
        ref={glowRef}
        className="relative w-full h-48 rounded-lg border border-white/10 overflow-hidden transition-all duration-150"
      >
        <p className="absolute inset-0 flex items-center justify-center text-sm text-[#8890A6]">
          Move your mouse — waiting on you to click the link
        </p>
      </div>
    </AuthCard>
  )
}