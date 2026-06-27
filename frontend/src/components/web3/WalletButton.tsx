'use client'

import { useState } from 'react'
import { useWallet } from './Web3Provider'
import { CHAIN } from '@/lib/config'
import { ExternalLink, LogOut, Wallet } from 'lucide-react'

export function WalletButton({ onConnect }: { onConnect?: () => void }) {
  const { address, isConnecting, isConnected, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl p-1 z-50 shadow-xl">
            <div className="px-3 py-2 text-xs text-zinc-500 border-b border-zinc-800 truncate">
              {address}
            </div>
            <a
              href={`${CHAIN.explorerUrl}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink size={14} /> View on Explorer
            </a>
            <button
              onClick={() => { disconnect(); setOpen(false) }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut size={14} /> Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        connect()
        onConnect?.()
      }}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-zinc-800 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
    >
      <Wallet size={16} />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
