'use client'

import { useWallet } from '@/components/web3/Web3Provider'
import { WalletButton } from '@/components/web3/WalletButton'
import { CHAIN } from '@/lib/config'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function LandingPage() {
  const { connect } = useWallet()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
          OracleX
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed max-w-xl mx-auto">
          Decentralized prediction markets on 0G. Create markets, place bets, and let on-chain data determine the outcome.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={connect}
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-all"
          >
            Connect Wallet
          </button>
          <a
            href="https://chainscan.0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-300 font-semibold text-sm transition-all"
          >
            View Explorer
          </a>
        </div>
        <WalletButton />
        <div className="mt-10 sm:mt-12 text-xs text-zinc-600">
          Built on 0G Mainnet
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { isConnected, chainId } = useWallet()
  const router = useRouter()
  const onWrongChain = isConnected && chainId !== 0 && chainId !== CHAIN.chainId

  const handleSwitchChain = async () => {
    const eth = (window as any).ethereum
    if (!eth) return
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4115' }],
      })
    } catch (e: any) {
      if (e.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x4115',
            chainName: '0G Mainnet (Aristotle)',
            nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
            rpcUrls: ['https://evmrpc.0g.ai'],
            blockExplorerUrls: ['https://chainscan.0g.ai'],
          }],
        })
      }
    }
  }

  if (!isConnected) {
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {onWrongChain && (
        <div className="border-b border-zinc-800 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              <span>Switch to <strong>0G Mainnet</strong> to use the platform</span>
            </div>
            <button
              onClick={handleSwitchChain}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
            >
              Switch to 0G
            </button>
          </div>
        </div>
      )}

      {!onWrongChain && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="glass-card p-8 text-center">
            <p className="text-zinc-400 mb-4">Welcome to OracleX</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="/markets"
                className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                Browse Markets
              </a>
              <a
                href="/portfolio"
                className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-medium hover:text-zinc-300 transition-colors"
              >
                My Portfolio
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-zinc-800 mt-8 sm:mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <span>OracleX on 0G</span>
          <div className="flex items-center gap-4">
            <a href={CHAIN.explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Explorer</a>
          </div>
        </div>
      </div>
    </div>
  )
}
