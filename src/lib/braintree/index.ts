import braintree from 'braintree'

if (
  !process.env.BRAINTREE_MERCHANT_ID ||
  !process.env.BRAINTREE_PUBLIC_KEY ||
  !process.env.BRAINTREE_PRIVATE_KEY
) {
  throw new Error('Braintree environment variables are not set')
}

export const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Production,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
})

/**
 * Generate a client token for the Braintree Drop-in UI on the checkout page.
 * If a customerId is provided, the vaulted payment methods are included.
 */
export async function generateClientToken(customerId?: string) {
  const options: braintree.ClientTokenRequest = customerId
    ? { customerId }
    : {}
  const result = await gateway.clientToken.generate(options)
  return result.clientToken
}

/**
 * Create a Braintree customer and vault the payment method from the checkout nonce.
 * This is called after the buyer completes checkout — the nonce is exchanged
 * for a vaulted payment method that can be charged server-side on upsells.
 */
export async function createCustomerWithVault(email: string, nonce: string) {
  const result = await gateway.customer.create({
    email,
    paymentMethodNonce: nonce,
  })
  if (!result.success) {
    throw new Error(`Braintree customer creation failed: ${result.message}`)
  }
  const customer = result.customer
  const paymentMethod = customer.paymentMethods?.[0]
  return {
    customerId: customer.id,
    paymentMethodToken: paymentMethod?.token,
  }
}

/**
 * Charge a vaulted PayPal payment method for a one-click upsell.
 * No redirect to PayPal — the vault token is charged server-side directly.
 */
export async function chargeVaultedPayPal(
  paymentMethodToken: string,
  amount: number,
  step: string
) {
  const result = await gateway.transaction.sale({
    amount: (amount / 100).toFixed(2),
    paymentMethodToken,
    options: { submitForSettlement: true },
    customFields: { funnel_step: step },
  })
  if (!result.success) {
    throw new Error(`Braintree charge failed: ${result.message}`)
  }
  return result.transaction
}

/**
 * Process a refund on a Braintree transaction.
 */
export async function refundTransaction(transactionId: string, amount?: number) {
  if (amount) {
    return gateway.transaction.refund(transactionId, (amount / 100).toFixed(2))
  }
  return gateway.transaction.refund(transactionId)
}
