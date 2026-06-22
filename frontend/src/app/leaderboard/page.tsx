'use client'

import { Trophy, Users, BarChart3 } from 'lucide-react'

export default function LeaderboardPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy size={28} className="text-primary" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">Top predictors ranked by accuracy and XP</p>
      </div>

      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Trophy size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Leaderboard Coming Soon</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          The leaderboard will track user accuracy, wins, XP points, and rankings once trading begins.
          Rankings will range from Bronze to Master tier.
        </p>
      </div>
    </div>
  )
}
