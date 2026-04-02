import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia' as const,
  typescript: true,
})

/**
 * Create a checkout PaymentIntent and save the payment method for future one-click upsells.
 * setup_future_usage: 'off_session' vaults the card for subsequent server-side charges.
 */
export async function createCheckoutIntent(amount: number, currency = 'usd') {
  return stripe.paymentIntents.create({
    amount,
    currency,
    setup_future_usage: 'off_session',
    automatic_payment_methods: { enabled: true },
    metadata: { funnel_step: 'checkout' },
  })
}

/**
 * Charge a vaulted payment method with a single server-side call.
 * No client interaction required — this is the one-click upsell mechanism.
 */
export async function chargeVaultedCard(
  paymentMethodId: string,
  customerId: string,
  amount: number,
  step: string,
  currency = 'usd'
) {
  const intent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    payment_method: paymentMethodId,
    confirm: true,
    off_session: true,
    metadata: { funnel_step: step },
  })
  return intent
}

/**
 * Create or retrieve a Stripe customer for vaulting purposes.
 */
export async function upsertStripeCustomer(email: string) {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0]
  return stripe.customers.create({ email })
}

/**
 * Attach a payment method to a customer after successful checkout.
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
) {
  return stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })
}

/**
 * Construct and verify a Stripe webhook event.
 */
export function constructWebhookEvent(payload: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
