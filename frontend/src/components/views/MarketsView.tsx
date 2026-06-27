'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useWallet } from '@/components/web3/Web3Provider'
import { CONTRACTS, CHAIN } from '@/lib/config'
import { formatEther } from 'ethers'
import {
  fetchAllMarkets,
  fetchMarketOutcomes,
  getFactoryContract,
  getMarketContract,
  getRpcProvider,
  isOwner,
  MarketData,
  MARKET_STATE_LABELS,
  getStateClass,
  getCategoryClass,
  CATEGORIES,
} from '@/lib/contracts'

function StateBadge({ state }: { state: number }) {
  const s = state as 0 | 1 | 2 | 3 | 4
  const label = MARKET_STATE_LABELS[s] || 'Unknown'
  const cls = getStateClass(state)
  return <span className={`badge ${cls}`}>{label}</span>
}

function OutcomeBar({ label, pool, totalPool, colorIndex }: { label: string; pool: bigint; totalPool: bigint; colorIndex: number }) {
  const pct = totalPool > 0n ? Number(pool * 100n / totalPool) : 0
  const colors = ['progress-fill-purple', 'progress-fill-blue', 'progress-fill-green', 'progress-fill-yellow', 'progress-fill-red']
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-zinc-300 truncate mr-2">{label}</span>
        <span className="text-zinc-500 font-mono tabular-nums flex-shrink-0">{formatEther(pool)} 0G ({pct}%)</span>
      </div>
      <div className="progress-bar">
        <div className={colors[colorIndex % colors.length]} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  )
}

export default function MarketsView() {
  const { provider, address } = useWallet()
  const [markets, setMarkets] = useState<{ address: string; data: MarketData }[]>([])
  const [outcomesCache, setOutcomesCache] = useState<Record<string, {name: string; pool: bigint}[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async () => {
    if (!provider) return
    setLoading(true)
    setError('')
    try {
      const m = await fetchAllMarkets()
      m.sort((a, b) => Number(b.data.createdAt - a.data.createdAt))
      setMarkets(m)

      // Pre-fetch outcomes for each market
      const cache: Record<string, {name: string; pool: bigint}[]> = {}
      for (const market of m.slice(0, 12)) {
        try {
          const outcomes = await fetchMarketOutcomes(market.address)
          cache[market.address] = outcomes.map(o => ({ name: o.name, pool: o.pool }))
        } catch {}
      }
      setOutcomesCache(cache)
    } catch (e: any) {
      setError(e.message || 'Failed to load markets')
    }
    setLoading(false)
  }, [provider])

  useEffect(() => { load() }, [load])

  const filtered = markets.filter((m) => {
    if (filter !== 'All' && m.data.category !== filter) return false
    if (searchQuery && !m.data.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Markets</h2>
        <span className="text-xs text-zinc-600">{markets.length} total</span>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2 text-sm w-full"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filter === c
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300 bg-zinc-800/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3 animate-pulse" />
              <div className="h-3 bg-zinc-800/50 rounded w-1/2 mb-2 animate-pulse" />
              <div className="h-2 bg-zinc-800/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-red-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-3 opacity-30"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          <p className="text-sm">No markets found</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((m, i) => {
            const outcomes = outcomesCache[m.address] || []
            const totalPool = outcomes.reduce((s, o) => s + o.pool, 0n)
            return (
              <Link key={m.address} href={`/markets/${Number(m.data.id)}`}>
                <div className="glass-card p-5 group cursor-pointer transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <StateBadge state={m.data.state} />
                        <span className={`badge ${getCategoryClass(m.data.category)}`}>{m.data.category}</span>
                      </div>
                      <h3 className="text-sm font-medium text-white leading-snug group-hover:text-zinc-200 transition-colors line-clamp-1">
                        {m.data.title}
                      </h3>
                    </div>
                  </div>

                  {/* Outcome bars */}
                  {outcomes.length > 0 && (
                    <div className="mb-4">
                      {outcomes.slice(0, 3).map((o, oi) => (
                        <OutcomeBar key={oi} label={o.name} pool={o.pool} totalPool={totalPool} colorIndex={oi} />
                      ))}
                      {outcomes.length > 3 && (
                        <p className="text-xs text-zinc-600 mt-1">+{outcomes.length - 3} more outcomes</p>
                      )}
                    </div>
                  )}

                  {/* Footer stats */}
                  <div className="flex items-center justify-between text-xs text-zinc-600 pt-3 border-t border-zinc-800">
                    <div className="flex items-center gap-4">
                      <span>{Number(m.data.participantCount)} bettors</span>
                      <span>{Number(formatEther(m.data.totalVolume)) > 0 ? `${Number(formatEther(m.data.totalVolume)).toFixed(1)} 0G` : 'No volume'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span className="tabular-nums">{new Date(Number(m.data.endDate) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
