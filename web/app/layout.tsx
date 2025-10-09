import './globals.css'
import React from 'react'
import Providers from './providers'
import ConnectButton from '@/components/ConnectButton'

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
              <a href="/">Home</a>
              <a href="/buy">Buy</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/tournaments">Tournaments</a>
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
