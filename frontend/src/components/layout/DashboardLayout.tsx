'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@/components/web3/Web3Provider'
import { isOwner } from '@/lib/contracts'
import { WalletButton } from '@/components/web3/WalletButton'

const NAV = [
  {
    section: 'Navigation',
    items: [
      { label: 'Markets', href: '/markets', icon: 'M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z' },
      { label: 'Portfolio', href: '/portfolio', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
      { label: 'Leaderboard', href: '/leaderboard', icon: 'M8 21V3h8v18H8zM3 21V9h4v12H3zM17 21V7h4v14h-4z' },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Create', href: '/create', icon: 'M12 5v14M5 12h14' },
      { label: 'Admin', href: '/admin', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { address, isConnected } = useWallet()
  const isOwnerWallet = isConnected && address && isOwner(address)
  const [menuOpen, setMenuOpen] = useState(false)

  // Filter nav items based on role
  const sections = NAV.map(s => ({
    ...s,
    items: s.items.filter(i => {
      if (i.label === 'Admin' && !isOwnerWallet) return false
      return true
    }),
  })).filter(s => s.items.length > 0)

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-zinc-800 bg-black flex-shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-zinc-800">
          <Link href="/" className="text-sm font-bold tracking-tight text-white">
            OracleX
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {sections.map((section) => (
            <div key={section.section}>
              <p className="px-3 mb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                {section.section}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-zinc-800">
          <WalletButton />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-black sticky top-0 z-50">
          <Link href="/" className="text-sm font-bold tracking-tight text-white">
            OracleX
          </Link>
          <div className="flex items-center gap-2">
            <WalletButton />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></> : <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>}
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="lg:hidden border-b border-zinc-800 bg-black px-3 py-2 space-y-4">
            {sections.map((section) => (
              <div key={section.section}>
                <p className="px-3 mb-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">{section.section}</p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={item.icon} />
                        </svg>
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
