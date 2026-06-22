'use client'

import { useState } from 'react'
import { CONTRACTS } from '@/lib/config'
import { WalletButton } from '@/components/web3/WalletButton'

const tabs = ['Markets', 'Leaderboard', 'Portfolio', 'Admin']

const demoMarkets = [
  { id: 1, title: 'BTC reaches $200K by Dec 2026?', category: 'Crypto', volume: '$1.2M', prob: 67 },
  { id: 2, title: 'ETH ETF volume exceeds $10B this month?', category: 'Crypto', volume: '$890K', prob: 43 },
  { id: 3, title: 'Monad TVL exceeds $5B this year?', category: 'DeFi', volume: '$450K', prob: 28 },
]

const leaderboardDemo = [
  { name: 'CryptoWhale', wins: 147, acc: 89, xp: 28400, tier: 'Diamond' },
  { name: 'AI Prophet', wins: 132, acc: 85, xp: 22100, tier: 'Platinum' },
  { name: 'Market Sage', wins: 118, acc: 82, xp: 18900, tier: 'Platinum' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('Markets')

  return (
    <div className="min-h-screen">

      {/* TOP BAR */}
      <div className="border-b border-border">
        <div className="page-wrap flex items-center justify-between py-0 h-14">
          <div className="flex items-center gap-1">
            <span className="text-base font-bold tracking-tight">OracleX AI</span>
            <span className="text-[10px] text-muted-foreground ml-2 border border-border rounded px-1.5 py-0.5">0G</span>
          </div>
          <div className="flex items-center gap-1">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`btn-minimal ${activeTab === t ? 'text-foreground' : 'text-muted-foreground'}`}
              >{t}</button>
            ))}
            <div className="ml-3"><WalletButton /></div>
          </div>
        </div>
      </div>

      <div className="page-wrap">

        {/* MARKETS SECTION */}
        {activeTab === 'Markets' && (
          <div>
            <h2 className="sec-title">Markets</h2>
            <div className="border border-border rounded-2xl overflow-hidden">
              {demoMarkets.map(m => (
                <div key={m.id} className="market-row">
                  <div className="flex items-center gap-3">
                    <span className="tag">{m.category}</span>
                    <span className="text-sm">{m.title}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-muted-foreground">{m.volume}</span>
                    <span className={`text-sm font-semibold tabular-nums ${m.prob >= 50 ? 'text-success' : 'text-destructive'}`}>{m.prob}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Deployed Contracts</p>
              <div className="grid md:grid-cols-2 gap-2 text-xs font-mono text-muted-foreground">
                <p>Factory: <span className="text-foreground">{CONTRACTS.factory}</span></p>
                <p>Access: <span className="text-foreground">{CONTRACTS.accessManager}</span></p>
                <p>Treasury: <span className="text-foreground">{CONTRACTS.treasury}</span></p>
                <p>Market: <span className="text-foreground">{CONTRACTS.market}</span></p>
              </div>
              <a href={`https://chainscan.0g.ai/address/${CONTRACTS.factory}`} target="_blank" className="btn-primary inline-block mt-4 text-xs">
                View on 0G ChainScan
              </a>
            </div>
          </div>
        )}

        {/* LEADERBOARD SECTION */}
        {activeTab === 'Leaderboard' && (
          <div>
            <h2 className="sec-title">Leaderboard</h2>
            <div className="border border-border rounded-2xl overflow-hidden">
              {leaderboardDemo.map((u, i) => (
                <div key={u.name} className="market-row">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <span className="text-sm font-medium">{u.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{u.tier}</span>
                  </div>
                  <div className="flex items-center gap-5 text-xs text-muted-foreground">
                    <span>{u.wins} wins</span>
                    <span className="text-success">{u.acc}%</span>
                    <span className="tabular-nums">{u.xp.toLocaleString()} xp</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PORTFOLIO SECTION */}
        {activeTab === 'Portfolio' && (
          <div>
            <h2 className="sec-title">Portfolio</h2>
            <div className="border border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm mb-4">Connect your wallet to view portfolio and active positions.</p>
              <WalletButton />
            </div>
          </div>
        )}

        {/* ADMIN SECTION */}
        {activeTab === 'Admin' && (
          <div>
            <h2 className="sec-title">Admin</h2>
            <div className="border border-border rounded-2xl p-5 space-y-4">
              <p className="text-xs text-muted-foreground">4 contracts deployed on 0G Mainnet (Chain ID: 16661). Admin functions available through smart contracts.</p>
              <a href={`https://chainscan.0g.ai/address/${CONTRACTS.accessManager}`} target="_blank" className="btn-primary inline-block text-xs">
                AccessManager on ChainScan
              </a>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="border-t border-border mt-10">
        <div className="page-wrap py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>OracleX AI &mdash; 0G Mainnet</span>
          <a href="https://github.com/Faisalsathu786/oraclex-ai" target="_blank" className="hover:text-foreground">GitHub</a>
        </div>
      </div>
    </div>
  )
}
