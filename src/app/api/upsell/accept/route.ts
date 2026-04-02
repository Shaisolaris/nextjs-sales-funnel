import { NextRequest, NextResponse } from 'next/server'
import { chargeVaultedCard } from '@/lib/stripe'
import { chargeVaultedPayPal } from '@/lib/braintree'
import { dispatchWebhook } from '@/lib/webhooks'
import { trackFunnelEvent } from '@/lib/posthog'
import type { FunnelStep } from '@/types'

const UPSELL_AMOUNTS: Record<string, number> = {
  'upsell-1': 29700,
  'downsell-1': 10000,
  'upsell-2': 19700,
  'downsell-2': 9700,
}

const NEXT_STEP: Record<string, FunnelStep> = {
  'upsell-1': 'upsell-2',
  'downsell-1': 'upsell-2',
  'upsell-2': 'thank-you',
  'downsell-2': 'thank-you',
}

interface AcceptBody {
  step: string
  sessionId: string
}

interface SessionData {
  paymentMethod: string
  stripePaymentMethodId?: string
  stripeCustomerId?: string
  braintreePaymentMethodToken?: string
}

async function getSession(sessionId: string): Promise<SessionData | null> {
  void sessionId
  return {
    paymentMethod: 'stripe',
    stripePaymentMethodId: 'pm_placeholder',
    stripeCustomerId: 'cus_placeholder',
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as AcceptBody
  const { step, sessionId } = body

  const amount = UPSELL_AMOUNTS[step]
  if (!amount) {
    return NextResponse.json({ success: false, error: 'Invalid step' }, { status: 400 })
  }

  const session = await getSession(sessionId)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
  }

  try {
    if (session.paymentMethod === 'stripe' && session.stripePaymentMethodId && session.stripeCustomerId) {
      await chargeVaultedCard(session.stripePaymentMethodId, session.stripeCustomerId, amount, step)
    } else if (session.paymentMethod === 'braintree' && session.braintreePaymentMethodToken) {
      await chargeVaultedPayPal(session.braintreePaymentMethodToken, amount, step)
    } else {
      return NextResponse.json({ success: false, error: 'No vaulted payment method' }, { status: 400 })
    }

    await dispatchWebhook({
      type: 'upsell',
      sessionId,
      step: step as FunnelStep,
      amount,
      currency: 'usd',
      paymentMethod: session.paymentMethod as 'stripe' | 'braintree',
      timestamp: new Date().toISOString(),
    })

    trackFunnelEvent(sessionId, 'upsell_accepted', { step, amount })

    return NextResponse.json({ success: true, nextStep: NEXT_STEP[step] || 'thank-you' })
  } catch (err) {
    console.error('Upsell charge failed:', err)
    return NextResponse.json({ success: false, error: 'Charge failed' }, { status: 500 })
  }
}
