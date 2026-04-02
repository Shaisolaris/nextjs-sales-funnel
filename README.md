# nextjs-sales-funnel

Production-ready multi-step sales funnel built with Next.js 14 App Router, deployed on Vercel. Supports one-click post-purchase upsells for both Stripe card payments and PayPal buyers via Braintree vaulting — no re-entering payment info at any step.

## Stack

- **Next.js 14** (App Router, React Server Components)
- **Stripe** — card checkout with `setup_future_usage: 'off_session'` for vault
- **Braintree** — PayPal vaulting via customer token, server-side one-click charges
- **PostHog** — funnel analytics and A/B testing per variant
- **Builder.io** — visual editor for team content updates (no code required)
- **Checkly** — checkout monitoring with country-specific alerting
- **Webhooks** — HMAC-signed event dispatch for purchases, upsells, and refunds
- **TypeScript** — strict mode, zero compile errors
- **Vercel** — edge deployment

## Funnel Flow

```
Landing Page
    ↓
Checkout (Stripe Elements + Braintree Drop-in)
    ↓
Upsell 1 ($297) — one click, vault charged server-side
    ↓ accept          ↓ decline
Upsell 2 ($197)    Downsell 1 ($100)
    ↓                   ↓
Thank You          Upsell 2 ($197)
                       ↓
                   Thank You
```

## Key Architecture Decisions

### One-Click Upsell Mechanism (Stripe)
At checkout, `setup_future_usage: 'off_session'` is set on the PaymentIntent. This instructs Stripe to vault the card for future server-side charges. On upsell accept, the server calls `stripe.paymentIntents.create` with `off_session: true` and `confirm: true` — no client interaction required.

### One-Click Upsell Mechanism (PayPal via Braintree)
At checkout, the buyer completes a Braintree Drop-in UI payment. The nonce is exchanged server-side for a vaulted `paymentMethodToken` stored against a Braintree customer. On upsell accept, `gateway.transaction.sale` is called with the token directly — no redirect to PayPal.

### A/B Testing
PostHog feature flags determine which funnel variant a visitor sees. All funnel events (`upsell_viewed`, `upsell_accepted`, `upsell_declined`) are tracked server-side with the variant as a property, enabling full-funnel conversion analysis per variant in the PostHog dashboard.

### Webhook Architecture
All purchase and upsell events are dispatched to configured endpoints with HMAC-SHA256 signatures for verification. Supports multiple endpoints via `WEBHOOK_ENDPOINTS` comma-separated env var.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── checkout/page.tsx             # Stripe Elements checkout
│   ├── upsell-1/page.tsx             # One-click upsell ($297)
│   ├── downsell-1/page.tsx           # Downsell ($100)
│   ├── upsell-2/page.tsx             # One-click upsell ($197)
│   ├── downsell-2/page.tsx           # Final downsell ($97)
│   ├── thank-you/page.tsx            # Order confirmation
│   └── api/
│       ├── checkout/create/route.ts  # Create Stripe PaymentIntent
│       ├── upsell/accept/route.ts    # Server-side one-click charge
│       ├── braintree/token/route.ts  # Braintree client token
│       └── webhooks/stripe/route.ts  # Stripe webhook handler
├── lib/
│   ├── stripe/index.ts               # Stripe vaulting utilities
│   ├── braintree/index.ts            # PayPal/Braintree vaulting
│   ├── posthog/index.ts              # Analytics and A/B testing
│   └── webhooks/index.ts             # Webhook dispatcher
└── types/index.ts                    # Shared TypeScript types
```

## Setup

```bash
git clone https://github.com/Shaisolaris/nextjs-sales-funnel.git
cd nextjs-sales-funnel
npm install
cp .env.example .env.local
# Fill in all environment variables
npm run dev
```

## Environment Variables

See `.env.example` for all required variables:
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET`
- `BRAINTREE_MERCHANT_ID` + `BRAINTREE_PUBLIC_KEY` + `BRAINTREE_PRIVATE_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST`
- `BUILDER_API_KEY`
- `NEXT_PUBLIC_BASE_URL`
- `WEBHOOK_ENDPOINTS` (comma-separated URLs)
- `WEBHOOK_SECRET` (HMAC signing secret)

## Session Storage

The current implementation uses a placeholder `getSession()` function. In production, replace this with Redis (via `ioredis`) or Prisma to store and retrieve:
- Payment method type (stripe/braintree)
- Stripe payment method ID and customer ID
- Braintree payment method token
- Purchase history per session

## Deployment

```bash
vercel deploy --prod
```

Set all environment variables in the Vercel dashboard. The Stripe webhook endpoint is `/api/webhooks/stripe`.
