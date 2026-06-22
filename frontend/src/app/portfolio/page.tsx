'use client'

import { TrendingUp, Award, Activity, BarChart3, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const activePositions = [
  { id: 1, market: 'BTC reaches $200K?', outcome: 'YES', amount: '$500', currentOdds: 67, payout: '$746', profit: '+$246', roi: '+49.2%' },
  { id: 2, market: 'ETH ETF $10B volume', outcome: 'NO', amount: '$300', currentOdds: 43, payout: '$698', profit: '+$398', roi: '+132.7%' },
  { id: 3, market: 'Pakistan wins World Cup', outcome: 'Pakistan', amount: '$200', currentOdds: 23, payout: '$870', profit: '+$670', roi: '+335%' },
]

const history = [
  { id: 1, market: 'Hantavirus 2026', outcome: 'NO', amount: '$100', result: 'Won', profit: '+$42', date: 'June 20, 2026' },
  { id: 2, market: 'Switzerland WC', outcome: 'NO', amount: '$250', result: 'Won', profit: '+$18', date: 'June 19, 2026' },
  { id: 3, market: 'Fed Rate Cut Q3', outcome: 'YES', amount: '$150', result: 'Lost', profit: '-$150', date: 'June 18, 2026' },
  { id: 4, market: 'Oil above $80', outcome: 'YES', amount: '$200', result: 'Won', profit: '+$280', date: 'June 15, 2026' },
]

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 size={28} className="text-primary" />
          Portfolio
        </h1>
        <p className="text-muted-foreground mt-1">Your active positions, history, and performance</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Invested', value: '$1,000', icon: Activity, change: null },
          { label: 'Est. Portfolio Value', value: '$2,314', icon: TrendingUp, change: '+$1,314' },
          { label: 'Total Points', value: '100', icon: Award, change: '1 per $10 volume' },
          { label: 'Win Rate', value: '75%', icon: Award, change: '3 of 4' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <stat.icon size={20} className="text-primary mb-3" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            {stat.change && <div className="text-xs text-success mt-1">{stat.change}</div>}
          </motion.div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          Active Positions ({activePositions.length})
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-border text-sm text-muted-foreground font-medium">
            <span className="col-span-2">Market</span>
            <span>Outcome</span>
            <span>Amount</span>
            <span>Odds</span>
            <span className="text-right">Est. Payout</span>
            <span className="text-right">ROI</span>
          </div>
          {activePositions.map((pos) => (
            <div key={pos.id} className="grid grid-cols-7 gap-4 p-4 items-center border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <span className="col-span-2 font-medium text-sm">{pos.market}</span>
              <span className="text-sm">{pos.outcome}</span>
              <span className="text-sm font-mono">{pos.amount}</span>
              <span className="text-sm">{pos.currentOdds}%</span>
              <div className="text-right">
                <span className="text-sm font-semibold">{pos.payout}</span>
                <span className="block text-xs text-success">{pos.profit}</span>
              </div>
              <span className="text-right text-sm text-success font-semibold">{pos.roi}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          Trade History
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-border text-sm text-muted-foreground font-medium">
            <span className="col-span-2">Market</span>
            <span>Outcome</span>
            <span>Amount</span>
            <span>Result</span>
            <span className="text-right">P&L</span>
          </div>
          {history.map((trade) => (
            <div key={trade.id} className="grid grid-cols-6 gap-4 p-4 items-center border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <span className="col-span-2 text-sm">{trade.market}</span>
              <span className="text-sm">{trade.outcome}</span>
              <span className="text-sm font-mono">{trade.amount}</span>
              <span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  trade.result === 'Won' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                }`}>
                  {trade.result}
                </span>
              </span>
              <span className={`text-right text-sm font-semibold ${trade.profit.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                {trade.profit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
