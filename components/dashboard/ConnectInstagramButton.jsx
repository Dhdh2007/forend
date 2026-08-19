'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Instagram, Loader2 } from 'lucide-react'
import { getInstagramConnectUrl, disconnectInstagram } from '@/lib/api'

export default function ConnectInstagramButton({ connected = false }) {
  const [loading, setLoading] = useState(false)
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  async function handleConnect() {
    setLoading(true)
    try {
      const { url } = await getInstagramConnectUrl()
      window.location.href = url
    } catch (err) {
      setLoading(false)
      console.error(err)
    }
  }

  async function handleDisconnect() {
    setLoading(true)
    setError(null)
    try {
      await disconnectInstagram()
      setConfirmingDisconnect(false)
      router.refresh()
    } catch (err) {
      setError(err.message || 'Could not disconnect right now.')
      setLoading(false)
    }
  }

  if (connected) {
    if (confirmingDisconnect) {
      return (
        <div className="space-y-2">
          <div className="rounded-lg border border-[#F2555522] bg-[#F2555511] px-4 py-3 text-xs text-[#F25555]">
            Disconnecting stops new DMs from being sent, but keeps your
            campaigns and past activity. You can reconnect anytime.
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#F25555] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#D94444] disabled:opacity-50"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? 'Disconnecting…' : 'Confirm disconnect'}
            </button>
            <button
              onClick={() => setConfirmingDisconnect(false)}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-xs text-[#8890A6] transition hover:text-white"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-[#F25555]">{error}</p>}
        </div>
      )
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#131622] px-4 py-2.5 text-sm text-[#8890A6]">
          <Instagram size={16} className="text-[#3ED9C4]" />
          Instagram connected
        </div>
        <button
          onClick={() => setConfirmingDisconnect(true)}
          className="rounded-lg border border-white/10 px-3 py-2.5 text-xs text-[#8890A6] transition hover:border-[#F2555544] hover:text-[#F25555]"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg bg-[#7C5CFC] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6A4CE0] disabled:opacity-50"
    >
      <Instagram size={16} />
      {loading ? 'Redirecting…' : 'Connect Instagram'}
    </button>
  )
}