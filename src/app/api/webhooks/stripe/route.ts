import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { dispatchWebhook } from '@/lib/webhooks'
import Stripe from 'stripe'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(payload, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      const step = intent.metadata?.funnel_step || 'checkout'
      await dispatchWebhook({
        type: step === 'checkout' ? 'purchase' : 'upsell',
        sessionId: intent.metadata?.session_id || intent.id,
        step: step as import('@/types').FunnelStep,
        amount: intent.amount,
        currency: intent.currency,
        paymentMethod: 'stripe',
        timestamp: new Date().toISOString(),
        metadata: intent.metadata as Record<string, string>,
      })
      break
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      await dispatchWebhook({
        type: 'refund',
        sessionId: charge.metadata?.session_id || charge.id,
        step: (charge.metadata?.funnel_step as import('@/types').FunnelStep) || 'checkout',
        amount: charge.amount_refunded,
        currency: charge.currency,
        paymentMethod: 'stripe',
        timestamp: new Date().toISOString(),
      })
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
