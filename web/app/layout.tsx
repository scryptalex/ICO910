import './globals.css'
import React from 'react'
import Providers from './providers'
import ConnectButton from '@/components/ConnectButton'
import Link from 'next/link'

export const metadata = {
  title: 'GTK ICO',
  description: 'Crypto Gaming ICO Platform'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
        <div className="container py-6">
          <header className="flex items-center justify-between mb-8">
            <div className="font-bold text-xl">GTK</div>
            <nav className="flex gap-6 text-sm">
              <Link href="/">Home</Link>
              <Link href="/buy">Buy</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/tournaments">Tournaments</Link>
            </nav>
            <ConnectButton />
          </header>
          {children}
        </div>
        </Providers>
      </body>
    </html>
  )
}
