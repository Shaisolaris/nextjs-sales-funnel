'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Downsell2Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') || ''
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)
    const res = await fetch('/api/upsell/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'downsell-2', sessionId }),
    })
    const data = await res.json() as { success: boolean; nextStep: string }
    if (data.success) {
      router.push(`/thank-you?session_id=${sessionId}`)
    } else {
      setLoading(false)
    }
  }

  function handleDecline() {
    router.push(`/thank-you?session_id=${sessionId}`)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 48, textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
        Last Chance — Final Offer
      </h1>
      <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 32 }}>
        Get access for just $97 — this is the absolute last time you will see this offer.
      </p>
      <button
        onClick={handleAccept}
        disabled={loading}
        style={{
          width: '100%',
          padding: '18px 24px',
          background: '#dc2626',
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
        {loading ? 'Processing...' : 'Yes! Add This For $97'}
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
        No thanks, I do not want this
      </button>
    </div>
  )
}

export default function Downsell2Page() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading...</div>}>
      <Downsell2Content />
    </Suspense>
  )
}
