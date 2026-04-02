import { NextRequest, NextResponse } from 'next/server'
import { generateClientToken } from '@/lib/braintree'

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('customerId') || undefined
  try {
    const token = await generateClientToken(customerId)
    return NextResponse.json({ token })
  } catch (err) {
    console.error('Failed to generate Braintree client token:', err)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
