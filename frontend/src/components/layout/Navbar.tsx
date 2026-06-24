'use client'

import Link from 'next/link'
import { WalletButton } from '@/components/web3/WalletButton'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">X</div>
            <span className="text-base font-bold">OracleX</span>
          </Link>
          <WalletButton />
        </div>
      </div>
    </nav>
  )
}
