'use client'

import { BarChart3, TrendingUp, Award, Activity } from 'lucide-react'

export default function PortfolioPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 size={28} className="text-primary" />
          Portfolio
        </h1>
        <p className="text-muted-foreground mt-1">Your positions, history, and performance</p>
      </div>

      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Activity size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Active Positions</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Your portfolio, including active positions, estimated payouts with ROI percentages,
          and trade history will populate here once you start predicting on markets.
        </p>
      </div>
    </div>
  )
}
