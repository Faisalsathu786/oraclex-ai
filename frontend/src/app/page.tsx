'use client'

import { useState } from 'react'
import { WalletButton } from '@/components/web3/WalletButton'

const tabs = ['Markets', 'Leaderboard', 'Portfolio', 'Admin']

const demoMarkets = [
  { id: 1, title: 'Bitcoin reaches $200,000 before December 2026', cat: 'Crypto', vol: '$1.2M', prob: 67 },
  { id: 2, title: 'Ethereum ETF volume exceeds $10B this month', cat: 'Crypto', vol: '$890K', prob: 43 },
  { id: 3, title: 'Monad TVL exceeds $5B by end of 2026', cat: 'DeFi', vol: '$450K', prob: 28 },
  { id: 4, title: 'Pakistan wins the Cricket World Cup 2026', cat: 'Sports', vol: '$320K', prob: 23 },
]

const leaderboard = [
  { r: 1, n: 'CryptoWhale', w: 147, a: 89, x: 28400, t: 'Diamond' },
  { r: 2, n: 'AI Prophet', w: 132, a: 85, x: 22100, t: 'Platinum' },
  { r: 3, n: 'Market Sage', w: 118, a: 82, x: 18900, t: 'Platinum' },
  { r: 4, n: 'Trend Finder', w: 104, a: 78, x: 15600, t: 'Gold' },
]

const portfolioPositions = [
  { m: 'BTC $200K?', o: 'YES', amt: 500, p: 746, r: '+49.2%' },
  { m: 'ETH ETF $10B', o: 'NO', amt: 300, p: 698, r: '+132.7%' },
  { m: 'Pakistan WC', o: 'Pakistan', amt: 200, p: 870, r: '+335%' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('Markets')

  return (
    <div className="min-h-screen bg-black text-white">

      {/* TOP NAV */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-base font-bold tracking-tight">OracleX</span>
            <div className="hidden md:flex items-center gap-1">
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === t ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
          <WalletButton />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* MARKETS TAB */}
        {activeTab === 'Markets' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Markets</h2>
              <div className="flex items-center gap-2">
                {['All', 'Crypto', 'Sports', 'DeFi'].map(c => (
                  <button key={c} className={`px-3 py-1 rounded-lg text-xs font-medium ${c === 'All' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{c}</button>
                ))}
              </div>
            </div>

            <div className="border border-zinc-800 rounded-2xl overflow-hidden">
              {demoMarkets.map(m => (
                <div key={m.id} className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">{m.cat}</span>
                    <span className="text-sm">{m.title}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-xs text-zinc-500">{m.vol}</span>
                    <span className={`text-sm font-semibold tabular-nums ${m.prob >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{m.prob}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'Leaderboard' && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Leaderboard</h2>
            <div className="border border-zinc-800 rounded-2xl overflow-hidden">
              {leaderboard.map(u => (
                <div key={u.r} className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-600 w-4">{u.r}</span>
                    <span className="text-sm font-medium">{u.n}</span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{u.t}</span>
                  </div>
                  <div className="flex items-center gap-5 text-xs text-zinc-500">
                    <span>{u.w} wins</span>
                    <span className="text-emerald-400">{u.a}%</span>
                    <span className="tabular-nums">{u.x.toLocaleString()} xp</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === 'Portfolio' && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Portfolio</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[{ l: 'Total Invested', v: '$1,000' }, { l: 'Est. Value', v: '$2,314', c: 'text-emerald-400' }, { l: 'Win Rate', v: '75%' }].map(s => (
                <div key={s.l} className="border border-zinc-800 rounded-2xl p-5">
                  <div className="text-lg font-semibold tabular-nums">{s.v}</div>
                  <div className="text-xs text-zinc-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-zinc-800 text-xs text-zinc-500 font-medium">
                <span className="col-span-2">Market</span><span>Outcome</span><span>Amount</span><span className="text-right">Est. Payout</span>
              </div>
              {portfolioPositions.map(p => (
                <div key={p.m} className="grid grid-cols-5 gap-4 px-5 py-3.5 items-center border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50 text-sm">
                  <span className="col-span-2">{p.m}</span>
                  <span className="text-xs">{p.o}</span>
                  <span className="text-xs">${p.amt}</span>
                  <div className="text-right"><span className="text-xs">${p.p}</span><span className="text-xs text-emerald-400 ml-2">{p.r}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'Admin' && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Admin</h2>
            <div className="border border-zinc-800 rounded-2xl p-6 text-sm text-zinc-500">
              <p>Admin panel for market moderation, user management, and platform settings. Available for authorized moderators.</p>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="border-t border-zinc-800 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-zinc-600">
          <span>OracleX &mdash; Prediction Markets</span>
          <a href="https://github.com/Faisalsathu786/oraclex-ai" className="hover:text-zinc-400">GitHub</a>
        </div>
      </div>
    </div>
  )
}
