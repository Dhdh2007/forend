'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthCard from '@/components/auth/auth'
import { Turnstile } from '@marsidev/react-turnstile'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://instabackend-m7wv.onrender.com"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReady, setTurnstileReady] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!turnstileToken) {
      setError('Please complete the security verification.')
      return
    }

    setLoading(true)

    const res = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        turnstile_token: turnstileToken,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body?.detail?.message || body?.detail || 'Something went wrong')
      return
    }

    // no session yet — user still has to click the magic link in their email
    router.push(`/verify?email=${encodeURIComponent(form.email)}`)
  }

  return (
    <AuthCard
      eyebrow="Create account"
      title="Start sending"
      subtitle="Free tier includes 100 DMs. No card needed."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-[#7C5CFC] hover:underline">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-[#8890A6] mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-[#0B0D14] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs text-[#8890A6] mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-[#0B0D14] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent"
            placeholder="At least 8 characters"
          />
        </div>

        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={(token) => { setTurnstileToken(token); setTurnstileReady(true); setError('') }}
          onExpire={() => { setTurnstileToken(''); setTurnstileReady(false) }}
          onError={() => {
            setTurnstileReady(false)
            setError('Security check failed to load. Please refresh and try again.')
          }}
        />

        <p className="text-[11px] text-[#8890A6] text-center leading-relaxed">
          This site is protected by Cloudflare and the Cloudflare{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7C5CFC] hover:underline"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://www.cloudflare.com/en-gb/turnstile-privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7C5CFC] hover:underline"
          >
            Terms of Service
          </a>{' '}
          apply.
        </p>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !turnstileReady}
          className="w-full bg-[#7C5CFC] hover:bg-[#6A4CE0] transition-colors rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Creating account…' : turnstileReady ? 'Create account' : 'Verifying…'}
        </button>

        <p className="text-[11px] text-[#8890A6] text-center leading-relaxed">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-[#7C5CFC] hover:underline">Terms of Service</Link>,{' '}
          <Link href="/privacy" className="text-[#7C5CFC] hover:underline">Privacy Policy</Link>, and{' '}
          <Link href="/data-deletion" className="text-[#7C5CFC] hover:underline">Data Deletion Policy</Link>.
        </p>
      </form>
    </AuthCard>
  )
}