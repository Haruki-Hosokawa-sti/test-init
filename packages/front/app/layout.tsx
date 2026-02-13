import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'test-init',
  description: 'test-init application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
