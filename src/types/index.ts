export type FunnelStep =
  | 'checkout'
  | 'upsell-1'
  | 'downsell-1'
  | 'upsell-2'
  | 'downsell-2'
  | 'thank-you'

export type PaymentMethod = 'stripe' | 'braintree'

export interface FunnelSession {
  sessionId: string
  email: string
  paymentMethod: PaymentMethod
  stripePaymentMethodId?: string
  braintreeCustomerId?: string
  braintreePaymentMethodNonce?: string
  purchases: Purchase[]
  createdAt: string
}

export interface Purchase {
  step: FunnelStep
  productId: string
  amount: number
  currency: string
  stripePaymentIntentId?: string
  braintreeTransactionId?: string
  timestamp: string
}

export interface Product {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  step: FunnelStep
}

export interface UpsellResult {
  accepted: boolean
  nextStep: FunnelStep
}

export interface WebhookEvent {
  type: 'purchase' | 'upsell' | 'downsell' | 'refund'
  sessionId: string
  step: FunnelStep
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  timestamp: string
  metadata?: Record<string, string>
}
