import type { WebhookEvent } from '@/types'

/**
 * Dispatch a webhook event to all configured endpoints.
 * Supports purchase, upsell, downsell, and refund events.
 */
export async function dispatchWebhook(event: WebhookEvent): Promise<void> {
  const endpoints = (process.env.WEBHOOK_ENDPOINTS || '').split(',').filter(Boolean)
  if (endpoints.length === 0) return

  const payload = JSON.stringify(event)
  const timestamp = Date.now().toString()

  await Promise.allSettled(
    endpoints.map(async (url) => {
      const signature = await signPayload(payload, timestamp)
      const res = await fetch(url.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Funnel-Timestamp': timestamp,
          'X-Funnel-Signature': signature,
        },
        body: payload,
      })
      if (!res.ok) {
        console.error(`Webhook delivery failed to ${url}: ${res.status}`)
      }
    })
  )
}

async function signPayload(payload: string, timestamp: string): Promise<string> {
  const secret = process.env.WEBHOOK_SECRET || 'default-secret'
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${timestamp}.${payload}`)
  )
  return Buffer.from(signature).toString('hex')
}
