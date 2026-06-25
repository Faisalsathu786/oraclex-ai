'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletButton } from '@/components/web3/WalletButton'
import { useWallet } from '@/components/web3/Web3Provider'
import { useTab } from '@/lib/tab-context'
import { isOwner } from '@/lib/contracts'
import { Plus, Menu, X } from 'lucide-react'

const TABS = ['Markets', 'Leaderboard', 'Portfolio', 'Admin']

const tabColors: Record<string, string> = {
  Markets: 'text-emerald-300 bg-emerald-500/15 shadow-sm shadow-emerald-500/20',
  Leaderboard: 'text-amber-300 bg-amber-500/15 shadow-sm shadow-amber-500/20',
  Portfolio: 'text-blue-300 bg-blue-500/15 shadow-sm shadow-blue-500/20',
  Admin: 'text-purple-300 bg-purple-500/15 shadow-sm shadow-purple-500/20',
}

export function Navbar() {
  const pathname = usePathname()
  const { isConnected, address } = useWallet()
  const { activeTab, setActiveTab } = useTab()
  const isOwnerWallet = isConnected && address && isOwner(address)
  const showTabs = isOwnerWallet ? TABS : TABS.slice(0, 3)
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)

  const handleTabClick = (t: string) => {
    setActiveTab(t)
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Left: Logo + Desktop Tabs */}
          <div className="flex items-center gap-6 sm:gap-10">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">OracleX</span>
            </Link>

            {/* Desktop Tabs */}
            {isHome && isConnected && (
              <div className="hidden lg:flex items-center gap-1.5">
                {showTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 xl:px-6 py-2 xl:py-2.5 rounded-xl text-sm xl:text-base font-semibold tracking-wide transition-all duration-200 ${
                      activeTab === t
                        ? tabColors[t]
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isHome && isOwnerWallet && (
              <Link
                href="/create"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-500 transition-colors"
              >
                <Plus size={14} /> <span className="hidden xl:inline">Create Market</span>
              </Link>
            )}
            <WalletButton />
            {/* Hamburger — mobile only */}
            {isHome && isConnected && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 -mr-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && isHome && isConnected && (
          <div className="lg:hidden border-t border-zinc-800 pb-3 pt-2 animate-in slide-in-from-top">
            <div className="flex flex-col gap-1">
              {showTabs.map((t) => (
                <button
                  key={t}
                  onClick={() => handleTabClick(t)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === t
                      ? tabColors[t]
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {t}
                </button>
              ))}
              {isOwnerWallet && (
                <Link
                  href="/create"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                >
                  <Plus size={14} /> Create Market
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
