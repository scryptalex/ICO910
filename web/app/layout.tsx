import './globals.css'
import React from 'react'

export const metadata = {
  title: 'GTK ICO',
  description: 'Crypto Gaming ICO Platform'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-6">
          <header className="flex items-center justify-between mb-8">
            <div className="font-bold text-xl">GTK</div>
            <nav className="flex gap-6 text-sm">
              <a href="/">Home</a>
              <a href="/buy">Buy</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/tournaments">Tournaments</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}

