'use client'

import { Trophy, Medal, TrendingUp, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const leaders = [
  { rank: 1, name: 'CryptoWhale', wins: 147, accuracy: 89, xp: 28400, tier: 'Diamond' },
  { rank: 2, name: 'AI Prophet', wins: 132, accuracy: 85, xp: 22100, tier: 'Platinum' },
  { rank: 3, name: 'Market Sage', wins: 118, accuracy: 82, xp: 18900, tier: 'Platinum' },
  { rank: 4, name: 'Trend Finder', wins: 104, accuracy: 78, xp: 15600, tier: 'Gold' },
  { rank: 5, name: 'Data Drifter', wins: 92, accuracy: 75, xp: 12300, tier: 'Gold' },
]

const tierColors: Record<string, string> = {
  Diamond: 'text-blue-400',
  Platinum: 'text-purple-400',
  Gold: 'text-yellow-400',
  Silver: 'text-gray-400',
  Bronze: 'text-orange-400',
}

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">Top predictors ranked by accuracy and XP</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Traders', value: '8,247', icon: Users },
          { label: 'Total Predictions', value: '42,891', icon: TrendingUp },
          { label: 'Avg Accuracy', value: '76.3%', icon: Trophy },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <stat.icon className="text-primary mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-border text-sm text-muted-foreground font-medium">
          <span>Rank</span>
          <span>Trader</span>
          <span className="text-right">Wins</span>
          <span className="text-right">Accuracy</span>
          <span className="text-right">XP</span>
        </div>
        {leaders.map((trader, i) => (
          <motion.div
            key={trader.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`grid grid-cols-5 gap-4 p-4 items-center ${
              i < 3 ? 'bg-primary/5' : ''
            } border-b border-border last:border-0 hover:bg-secondary/30 transition-colors`}
          >
            <div className="flex items-center gap-2">
              {trader.rank <= 3 ? (
                <Medal size={20} className={trader.rank === 1 ? 'text-yellow-400' : trader.rank === 2 ? 'text-gray-300' : 'text-orange-400'} />
              ) : (
                <span className="text-muted-foreground font-mono">{trader.rank}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{trader.name}</span>
              <span className={`text-xs font-medium ${tierColors[trader.tier] || ''}`}>{trader.tier}</span>
            </div>
            <span className="text-right font-mono">{trader.wins}</span>
            <span className={`text-right font-mono ${trader.accuracy >= 80 ? 'text-success' : 'text-warning'}`}>
              {trader.accuracy}%
            </span>
            <span className="text-right font-mono text-primary">{trader.xp.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
