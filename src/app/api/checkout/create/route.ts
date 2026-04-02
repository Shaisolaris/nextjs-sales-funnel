import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutIntent, upsertStripeCustomer } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  amount: z.number().int().positive(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid request' },
      { status: 400 }
    )
  }

  const { email, amount } = parsed.data

  try {
    const customer = await upsertStripeCustomer(email)
    const intent = await createCheckoutIntent(amount)

    return NextResponse.json({
      clientSecret: intent.client_secret,
      customerId: customer.id,
    })
  } catch (err) {
    console.error('Failed to create checkout intent:', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
