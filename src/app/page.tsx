import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 64, textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>
        Your Headline Goes Here
      </h1>
      <p style={{ fontSize: 20, color: '#6b7280', marginBottom: 48, lineHeight: 1.6 }}>
        Your compelling subheadline that explains the value of what you are selling
        and why the visitor needs it right now.
      </p>
      <Link
        href="/checkout"
        style={{
          display: 'inline-block',
          padding: '20px 48px',
          background: '#2563eb',
          color: '#fff',
          borderRadius: 8,
          fontSize: 20,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Get Started Now
      </Link>
    </div>
  )
}
