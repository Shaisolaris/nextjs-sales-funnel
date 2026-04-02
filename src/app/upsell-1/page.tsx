'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Upsell1Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') || ''
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)
    const res = await fetch('/api/upsell/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'upsell-1', sessionId }),
    })
    const data = await res.json() as { success: boolean; nextStep: string }
    if (data.success) {
      router.push(`/${data.nextStep}?session_id=${sessionId}`)
    } else {
      setLoading(false)
    }
  }

  function handleDecline() {
    router.push(`/downsell-1?session_id=${sessionId}`)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 48, textAlign: 'center' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
        Wait! Special One-Time Offer
      </h1>
      <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 32 }}>
        Add this to your order right now for just $297 — no need to re-enter your payment info.
      </p>
      <button
        onClick={handleAccept}
        disabled={loading}
        style={{
          width: '100%',
          padding: '18px 24px',
          background: '#16a34a',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 18,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginBottom: 16,
        }}
      >
        {loading ? 'Processing...' : 'Yes! Add This For $297'}
      </button>
      <button
        onClick={handleDecline}
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          fontSize: 14,
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        No thanks, I don&apos;t want this
      </button>
    </div>
  )
}

export default function Upsell1Page() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading...</div>}>
      <Upsell1Content />
    </Suspense>
  )
}
