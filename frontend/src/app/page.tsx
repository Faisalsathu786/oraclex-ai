'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWallet } from '@/components/web3/Web3Provider'
import { CHAIN } from '@/lib/config'
import { formatEther } from 'ethers'
import {
  fetchAllMarkets,
  fetchMarketOutcomes,
  getFactoryContract,
  getTreasuryContract,
  getRpcProvider,
} from '@/lib/contracts'

export default function Home() {
  const { isConnected, connect, chainId } = useWallet()
  const [stats, setStats] = useState({ markets: 0, volume: '0', participants: 0, treasury: '0' })
  const [featured, setFeatured] = useState<{ id: number; title: string; category: string; volume: string; outcomes: { name: string; pool: bigint }[] }[]>([])
  const [loading, setLoading] = useState(true)
  const onWrongChain = isConnected && chainId !== 0 && chainId !== CHAIN.chainId

  useEffect(() => {
    const load = async () => {
      try {
        const rpc = getRpcProvider()
        const factory = getFactoryContract(rpc)
        const count = await factory.marketCount()
        setStats(s => ({ ...s, markets: Number(count) }))

        const all = await fetchAllMarkets()
        const totalVol = all.reduce((s, m) => s + Number(formatEther(m.data.totalVolume)), 0)
        const totalP = all.reduce((s, m) => s + Number(m.data.participantCount), 0)
        setStats(s => ({ ...s, volume: totalVol.toFixed(1), participants: totalP }))

        const treasury = getTreasuryContract(rpc)
        try {
          const tres = await treasury.getStats()
          setStats(s => ({ ...s, treasury: formatEther(tres[2] || 0n).slice(0, 8) }))
        } catch {}

        const open = all.filter(m => m.data.state === 1).slice(0, 3)
        const feat = []
        for (const m of open) {
          const outcomes = await fetchMarketOutcomes(m.address)
          feat.push({
            id: Number(m.data.id),
            title: m.data.title,
            category: m.data.category,
            volume: Number(formatEther(m.data.totalVolume)).toFixed(1),
            outcomes: outcomes.map(o => ({ name: o.name, pool: o.pool })),
          })
        }
        setFeatured(feat)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const handleSwitchChain = async () => {
    const eth = (window as any).ethereum
    if (!eth) return
    try {
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x4115' }] })
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

  return (
    <div className="min-h-screen bg-black text-white">
      {isConnected && onWrongChain && (
        <div className="border-b border-zinc-800 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              <span>Switch to <strong>0G Mainnet</strong> to use the platform</span>
            </div>
            <button onClick={handleSwitchChain} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">Switch to 0G</button>
          </div>
        </div>
      )}

      <section className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 text-white">
            OracleX
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Decentralized prediction markets on 0G. Create markets, trade outcomes, and let the chain settle the score.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/markets" className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-all">
              Explore Markets
            </Link>
            {!isConnected && (
              <button onClick={connect} className="px-6 py-3 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-300 font-semibold text-sm transition-all">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Markets', value: stats.markets.toString() },
              { label: 'Volume', value: stats.volume + ' 0G' },
              { label: 'Participants', value: stats.participants.toString() },
              { label: 'Treasury', value: stats.treasury + ' 0G' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold tabular-nums text-white">{s.value || '0'}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Open Markets</h2>
          <Link href="/markets" className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-4 animate-pulse" />
                <div className="h-3 bg-zinc-800/50 rounded w-1/2 mb-3 animate-pulse" />
                <div className="h-2 bg-zinc-800/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="card p-10 text-center text-zinc-600 text-sm">
            No open markets yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map((m) => {
              const totalPool = m.outcomes.reduce((s, o) => s + o.pool, 0n)
              return (
                <Link key={m.id} href={`/markets/${m.id}`}>
                  <div className="card p-5 group cursor-pointer transition-all duration-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{m.category}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white leading-snug group-hover:text-zinc-200 transition-colors line-clamp-2 mb-4">
                      {m.title}
                    </h3>
                    {m.outcomes.slice(0, 2).map((o, oi) => {
                      const pct = totalPool > 0n ? Number(o.pool * 100n / totalPool) : 0
                      return (
                        <div key={oi} className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-400 truncate mr-2">{o.name}</span>
                          <span className="text-zinc-600 font-mono flex-shrink-0">{pct}%</span>
                        </div>
                      )
                    })}
                    <div className="text-xs text-zinc-600 mt-3 pt-3 border-t border-zinc-800">
                      {m.volume} 0G volume
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <h2 className="text-lg font-bold text-white mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Choose a Market', desc: 'Browse open markets and pick an event to predict.' },
              { step: '02', title: 'Place Your Bet', desc: 'Select an outcome and stake 0G tokens on your prediction.' },
              { step: '03', title: 'Collect Winnings', desc: 'When the market resolves, winning bets are paid out automatically.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <p className="text-xs font-bold text-zinc-600 mb-2">{s.step}</p>
                <p className="text-sm font-semibold text-white mb-2">{s.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-zinc-500">
          <span>OracleX on 0G</span>
          <a href={CHAIN.explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Explorer</a>
        </div>
      </div>
    </div>
  )
}
