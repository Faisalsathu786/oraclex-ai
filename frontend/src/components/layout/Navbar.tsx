'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { WalletButton } from '@/components/web3/WalletButton'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-[hsl(var(--background))]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">X</div>
              <span className="text-lg font-bold gradient-text">OracleX AI</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/markets" className="btn-ghost text-sm">Explore</Link>
              <Link href="/leaderboard" className="btn-ghost text-sm">Leaderboard</Link>
              <Link href="/portfolio" className="btn-ghost text-sm">Portfolio</Link>
              <Link href="/admin" className="btn-ghost text-sm">Admin</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
            <WalletButton />
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-surface p-4 space-y-2 animate-fade-in">
          <Link href="/markets" className="block btn-ghost w-full text-left">Explore Markets</Link>
          <Link href="/leaderboard" className="block btn-ghost w-full text-left">Leaderboard</Link>
          <Link href="/create" className="block btn-ghost w-full text-left">Create Market</Link>
          <Link href="/dashboard" className="block btn-ghost w-full text-left">Dashboard</Link>
          <Link href="/login" className="btn-primary w-full text-center block mt-2">Launch App</Link>
        </div>
      )}
    </nav>
  )
}
