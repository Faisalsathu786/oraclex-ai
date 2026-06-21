'use client'

import Link from 'next/link'
import { Search, Clock, TrendingUp, Award, ImageOff } from 'lucide-react'
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
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400',
  },
  {
    id: '2',
    title: 'Will Ethereum ETF volume exceed $10B this month?',
    category: 'Crypto',
    volume: '$890K',
    probability: 43,
    endDate: 'Jun 30, 2026',
    participants: '856',
    image: '',
  },
  {
    id: '3',
    title: 'Will Monad TVL exceed $5B this year?',
    category: 'DeFi',
    volume: '$450K',
    probability: 28,
    endDate: 'Dec 31, 2026',
    participants: '421',
    image: '',
  },
]

export default function MarketsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Explore Markets</h1>
          <p className="text-muted-foreground mt-1">Browse all available prediction markets</p>
        </div>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map((market, i) => (
          <motion.div
            key={market.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/markets/${market.id}`}>
              <div className="glass-card-hover overflow-hidden group">
                {market.image ? (
                  <div className="h-40 overflow-hidden">
                    <img src={market.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="h-40 bg-surface flex items-center justify-center">
                    <ImageOff size={32} className="text-muted-foreground/50" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-primary">{market.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {market.endDate}
                    </span>
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{market.title}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><TrendingUp size={12} />{market.volume}</span>
                      <span className="flex items-center gap-1"><Award size={12} />{market.participants}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${market.probability >= 50 ? 'text-success' : 'text-destructive'}`}>
                        {market.probability}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">Buy YES</div>
                    </div>
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
