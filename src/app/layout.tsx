import type { Metadata } from 'next'
import './globals.css'
import { Afacad_Flux } from 'next/font/google'

const afacadFlux = Afacad_Flux({
  subsets: ['latin'],
  weight: '600',
  variable: '--font-afacad-flux',
})

export const metadata: Metadata = {
  title: 'The Ambitions',
  icons: {
    icon: "/favicon.ico",
  },
  description: 'Professional agentic web application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={afacadFlux.variable}>
      <body className={afacadFlux.className}>{children}</body>
    </html>
  )
}
