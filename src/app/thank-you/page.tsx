'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') || ''

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 64, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
        Thank You For Your Purchase!
      </h1>
      <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 8 }}>
        Your order has been confirmed. Check your email for access details.
      </p>
      {sessionId && (
        <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 24 }}>
          Order reference: {sessionId}
        </p>
      )}
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  )
}
