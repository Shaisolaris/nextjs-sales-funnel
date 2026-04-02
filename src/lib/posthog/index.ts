import { PostHog } from 'posthog-node'

const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
})

export type FunnelEvent =
  | 'funnel_page_viewed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'upsell_viewed'
  | 'upsell_accepted'
  | 'upsell_declined'
  | 'downsell_viewed'
  | 'downsell_accepted'
  | 'downsell_declined'
  | 'funnel_completed'

/**
 * Track a funnel event server-side with full metadata for PostHog funnel analysis.
 */
export function trackFunnelEvent(
  distinctId: string,
  event: FunnelEvent,
  properties: Record<string, unknown> = {}
) {
  client.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      $lib: 'nextjs-sales-funnel',
    },
  })
}

/**
 * Get the active A/B test variant for a user.
 * Returns the feature flag value from PostHog — use this to serve different
 * funnel variants and track conversion per variant.
 */
export async function getABVariant(
  distinctId: string,
  flagKey: string
): Promise<string | boolean> {
  const flags = await client.getAllFlags(distinctId)
  return flags[flagKey] ?? false
}

/**
 * Flush all queued events — call this at the end of server-side handlers.
 */
export async function flushPostHog() {
  await client.shutdown()
}
