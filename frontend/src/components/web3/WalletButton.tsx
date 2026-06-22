'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [open, setOpen] = useState(false)

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/20 border border-success/30 text-success text-sm font-medium hover:bg-success/30 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-success" />
          {shortAddr}
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 glass-card p-2 z-50">
            <button
              onClick={() => { disconnect(); setOpen(false) }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="btn-primary text-sm py-2 px-4"
    >
      Connect Wallet
    </button>
  )
}
