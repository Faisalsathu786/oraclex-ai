'use client'

import Link from 'next/link'
import { Search, Clock, Filter, BarChart3 } from 'lucide-react'

export default function MarketsPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 size={28} className="text-primary" />
          Explore Markets
        </h1>
        <p className="text-muted-foreground mt-1">Browse all available prediction markets on OracleX</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <p className="text-sm text-muted-foreground">
          Markets will appear here once created by platform moderators. All market data is stored on-chain
          and verified through 0G Chain.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input type="text" placeholder="Search markets..." className="input-field pl-10" />
        </div>
        {['All', 'Crypto', 'Sports', 'Politics', 'AI'].map((cat) => (
          <button key={cat} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            cat === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}>{cat}</button>
        ))}
      </div>

      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Markets Yet</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
          Prediction markets are created by platform moderators. Check back soon for the first markets.
          The test market "Who wins the Cricket World Cup 2026?" is already deployed on 0G Chain.
        </p>
        <div className="glass-card inline-block p-4 text-left">
          <p className="text-xs text-muted-foreground font-mono">
            Factory: 0xb948466cf5c6da634C9D5ad85f6a133267aD7030
          </p>
        </div>
      </div>
    </div>
  )
}
