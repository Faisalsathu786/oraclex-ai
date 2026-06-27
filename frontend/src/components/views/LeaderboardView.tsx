'use client'

export default function LeaderboardView() {
  return (
    <div>
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-6">Leaderboard</h2>
      <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-4 opacity-30"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9Z"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9Z"/><path d="M4 22h16"/><path d="M10 22V12"/><path d="M14 22V12"/><path d="M12 22v-4"/><path d="M12 8V5"/><path d="M8 5h8"/><path d="M12 2v3"/></svg>
        <p className="text-sm text-zinc-500 mb-1">Leaderboard coming soon</p>
        <p className="text-xs text-zinc-600">Rankings will be calculated from on-chain prediction data</p>
      </div>
    </div>
  )
}
