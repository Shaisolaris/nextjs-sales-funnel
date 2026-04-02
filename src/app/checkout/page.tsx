'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/upsell-1`,
      },
    })

    if (result.error) {
      setError(result.error.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 auto', padding: 32 }}>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700 }}>
        Complete Your Order
      </h1>
      <PaymentElement />
      {error && (
        <p style={{ color: '#ef4444', marginTop: 12, fontSize: 14 }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !stripe}
        style={{
          marginTop: 24,
          width: '100%',
          padding: '14px 24px',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  )
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { client_secret?: string }
}) {
  const clientSecret = searchParams.client_secret

  if (!clientSecret) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p>Loading checkout...</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  )
}
