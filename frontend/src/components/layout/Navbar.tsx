'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletButton } from '@/components/web3/WalletButton'
import { useWallet } from '@/components/web3/Web3Provider'
import { useTab } from '@/lib/tab-context'
import { isOwner } from '@/lib/contracts'
import { Plus } from 'lucide-react'

const TABS = ['Markets', 'Leaderboard', 'Portfolio', 'Admin']

export function Navbar() {
  const pathname = usePathname()
  const { isConnected, address } = useWallet()
  const { activeTab, setActiveTab } = useTab()
  const isOwnerWallet = isConnected && address && isOwner(address)
  const showTabs = isOwnerWallet ? TABS : TABS.slice(0, 3)
  const isHome = pathname === '/'

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Tabs */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                X
              </div>
              <span className="text-lg font-bold tracking-tight">OracleX</span>
            </Link>

            {/* Tabs — only on home page when connected */}
            {isHome && isConnected && (
              <div className="hidden md:flex items-center gap-2">
                {showTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-6 py-2.5 rounded-xl text-base font-semibold tracking-wide transition-all duration-200 ${
                      activeTab === t
                        ? t === 'Markets'
                          ? 'text-emerald-300 bg-emerald-500/15 shadow-sm shadow-emerald-500/20'
                          : t === 'Leaderboard'
                          ? 'text-amber-300 bg-amber-500/15 shadow-sm shadow-amber-500/20'
                          : t === 'Portfolio'
                          ? 'text-blue-300 bg-blue-500/15 shadow-sm shadow-blue-500/20'
                          : 'text-purple-300 bg-purple-500/15 shadow-sm shadow-purple-500/20'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Create + Wallet */}
          <div className="flex items-center gap-3">
            {isHome && isOwnerWallet && (
              <Link
                href="/create"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-500 transition-colors"
              >
                <Plus size={14} /> Create Market
              </Link>
            )}
            <WalletButton />
          </div>
        </div>

        {/* Mobile Tabs row */}
        {isHome && isConnected && (
          <div className="md:hidden pb-3 flex gap-1 overflow-x-auto tabs-scroll">
            {showTabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === t ? 'bg-zinc-800 text-white' : 'text-zinc-500'
                }`}
              >
                {t}
              </button>
            ))}
            {isOwnerWallet && (
              <Link
                href="/create"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white whitespace-nowrap"
              >
                + New Market
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
