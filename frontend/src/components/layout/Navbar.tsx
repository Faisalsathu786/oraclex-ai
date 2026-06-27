'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletButton } from '@/components/web3/WalletButton'
import { useWallet } from '@/components/web3/Web3Provider'
import { isOwner } from '@/lib/contracts'

const NAV_ITEMS = [
  { label: 'Markets', href: '/markets' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Admin', href: '/admin' },
]

export function Navbar() {
  const pathname = usePathname()
  const { isConnected, address } = useWallet()
  const isOwnerWallet = isConnected && address && isOwner(address)
  const visibleItems = isOwnerWallet ? NAV_ITEMS : NAV_ITEMS.filter(i => i.label !== 'Admin')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-10">
            <Link href="/" className="text-sm sm:text-base font-bold tracking-tight text-white">
              OracleX
            </Link>

            {isConnected && (
              <div className="hidden lg:flex items-center gap-1.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isConnected && isOwnerWallet && (
              <Link
                href="/create"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                Create Market
              </Link>
            )}
            <WalletButton />
            {isConnected && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 -mr-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Toggle menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{menuOpen ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></> : <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>}</svg>
              </button>
            )}
          </div>
        </div>

        {menuOpen && isConnected && (
          <div className="lg:hidden border-t border-zinc-800 pb-3 pt-2">
            <div className="flex flex-col gap-1">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {isOwnerWallet && (
                <Link
                  href="/create"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                  Create Market
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
