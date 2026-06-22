'use client'

import Link from 'next/link'
import { BarChart3, TrendingUp, Award, Activity, Users, DollarSign, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 size={28} className="text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Your personal overview of markets, positions, and performance</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Portfolio Value', value: '$2,314', icon: DollarSign, change: '+12.4%' },
          { label: 'Active Positions', value: '3', icon: Activity, change: '2 winning' },
          { label: 'Total Volume', value: '$1,000', icon: TrendingUp, change: '100 points' },
          { label: 'Win Rate', value: '75%', icon: Award, change: '3 of 4' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <stat.icon size={20} className="text-primary mb-3" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            <div className="text-xs text-success mt-1">{stat.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Activity size={18} className="text-primary" />Active Positions</h3>
            <Link href="/portfolio" className="text-sm text-primary hover:text-primary/80">View All <ArrowRight size={14} className="inline" /></Link>
          </div>
          <div className="space-y-3">
            {[
              { market: 'BTC reaches $200K?', outcome: 'YES', est: '$746', roi: '+49.2%' },
              { market: 'ETH ETF $10B volume', outcome: 'NO', est: '$698', roi: '+132.7%' },
              { market: 'Pakistan wins WC', outcome: 'Pakistan', est: '$870', roi: '+335%' },
            ].map((pos) => (
              <div key={pos.market} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors">
                <div>
                  <div className="text-sm font-medium">{pos.market}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Outcome: {pos.outcome}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{pos.est}</div>
                  <div className="text-xs text-success">{pos.roi}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><TrendingUp size={18} className="text-primary" />Trending Markets</h3>
            <Link href="/markets" className="text-sm text-primary hover:text-primary/80">Explore <ArrowRight size={14} className="inline" /></Link>
          </div>
          <div className="space-y-3">
            {[
              { market: 'BTC reaches $200K?', volume: '$1.2M', prob: '67%' },
              { market: 'ETH ETF $10B volume', volume: '$890K', prob: '43%' },
              { market: 'Monad TVL $5B', volume: '$450K', prob: '28%' },
            ].map((m) => (
              <div key={m.market} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors">
                <div className="text-sm font-medium">{m.market}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{m.volume}</span>
                  <span className="font-semibold text-foreground">{m.prob}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Users size={18} className="text-primary" />Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Placed bet on BTC reaches $200K', time: '2 hours ago' },
            { action: 'Claimed reward +$42 on Hantavirus market', time: '1 day ago' },
            { action: 'Reached Silver rank on leaderboard', time: '2 days ago' },
            { action: 'Earned 24 points from recent bets', time: '2 days ago' },
            { action: 'Created account and joined OracleX', time: '1 week ago' },
          ].map((item) => (
            <div key={item.action} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{item.action}</span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
