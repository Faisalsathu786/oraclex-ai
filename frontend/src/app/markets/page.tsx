'use client'

import Link from 'next/link'
import { Search, Filter, TrendingUp, Clock, Award } from 'lucide-react'
import { motion } from 'framer-motion'

const markets = [
  {
    id: '1',
    title: 'Will BTC reach $200,000 before Dec 2026?',
    category: 'Crypto',
    volume: '$1.2M',
    probability: 67,
    endDate: 'Dec 31, 2026',
    participants: '1.2K',
  },
  {
    id: '2',
    title: 'Will Ethereum ETF volume exceed $10B this month?',
    category: 'Crypto',
    volume: '$890K',
    probability: 43,
    endDate: 'Jun 30, 2026',
    participants: '856',
  },
  {
    id: '3',
    title: 'Will Monad TVL exceed $5B this year?',
    category: 'DeFi',
    volume: '$450K',
    probability: 28,
    endDate: 'Dec 31, 2026',
    participants: '421',
  },
]

export default function MarketsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Explore Markets</h1>
          <p className="text-muted-foreground mt-1">Discover and trade prediction markets</p>
        </div>
        <Link href="/create" className="btn-primary text-sm text-center">Create Market</Link>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input type="text" placeholder="Search markets..." className="input-field pl-10" />
        </div>
        {['All', 'Crypto', 'Sports', 'Politics', 'AI', 'Finance'].map((cat) => (
          <button key={cat} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            cat === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}>{cat}</button>
        ))}
      </div>

      <div className="space-y-4">
        {markets.map((market, i) => (
          <motion.div
            key={market.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/markets/${market.id}`}>
              <div className="glass-card-hover p-6 cursor-pointer group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge-primary">{market.category}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} /> {market.endDate}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{market.title}</h3>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span><TrendingUp size={14} className="inline mr-1" />{market.volume}</span>
                      <span><Award size={14} className="inline mr-1" />{market.participants} traders</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${market.probability >= 50 ? 'text-success' : 'text-destructive'}`}>
                      {market.probability}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">YES odds</div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
