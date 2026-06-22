'use client'

import { BarChart3, Activity, TrendingUp, Award } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 size={28} className="text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Your personal overview once you connect your wallet</p>
      </div>

      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Activity size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect Wallet to View Dashboard</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Your portfolio, active positions, estimated payouts, and trading history will appear here
          once you connect your wallet and start predicting.
        </p>
      </div>
    </div>
  )
}
