'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window { ethereum?: any }
}

export function WalletButton() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const check = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts[0]) setAddress(accounts[0])
        window.ethereum.on('accountsChanged', (accs: string[]) => {
          setAddress(accs[0] || '')
        })
      }
    }
    check()
  }, [])

  const connect = async () => {
    if (!window.ethereum) {
      alert('Install MetaMask browser extension')
      return
    }
    setLoading(true)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAddress(accounts[0])
      // switch to 0G mainnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4115' }], // 16661 in hex
        })
      } catch (e: any) {
        if (e.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x4115',
              chainName: '0G Mainnet',
              nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
              rpcUrls: ['https://evmrpc.0g.ai'],
              blockExplorerUrls: ['https://chainscan.0g.ai'],
            }],
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const disconnect = () => {
    setAddress('')
    setOpen(false)
  }

  if (address) {
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-xl p-1 z-50 shadow-xl">
            <button onClick={disconnect} className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-zinc-800">
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button onClick={connect} disabled={loading}
      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50"
    >
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
