import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sales Funnel',
  description: 'High-converting sales funnel with one-click upsells',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#f9fafb', color: '#111827' }}>
        {children}
      </body>
    </html>
  )
}
