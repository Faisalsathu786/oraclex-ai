'use client'

import { useState } from 'react'
import { CONTRACTS } from '@/lib/config'
import { WalletButton } from '@/components/web3/WalletButton'

const tabs = ['Markets', 'Leaderboard', 'Portfolio', 'Admin']

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

        {/* MARKETS */}
        {activeTab === 'Markets' && (
          <div>
            <h2 className="sec-title">Markets</h2>
            <div className="border border-border rounded-2xl p-6 text-center text-sm text-muted-foreground">
              <p>No active markets. Markets are created by platform moderators via the Factory contract.</p>
              <p className="mt-2 text-xs">Test market deployed: Who wins the Cricket World Cup 2026? (Pakistan, India, Australia, England)</p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-xs font-medium uppercase tracking-wide mb-3">Deployed on 0G Mainnet (Chain 16661)</p>
                <div className="space-y-1.5">
                  {[{ n: 'Factory', a: CONTRACTS.factory }, { n: 'Access', a: CONTRACTS.accessManager }, { n: 'Treasury', a: CONTRACTS.treasury }, { n: 'Market', a: CONTRACTS.market }].map(c => (
                    <p key={c.n} className="text-xs font-mono">
                      <span className="text-muted-foreground">{c.n}:</span>{' '}
                      <span className="text-foreground">{c.a}</span>
                    </p>
                  ))}
                </div>
                <a href={`https://chainscan.0g.ai/address/${CONTRACTS.factory}`} target="_blank" className="btn-primary inline-block mt-4 text-xs">
                  View on ChainScan
                </a>
              </div>
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
        {activeTab === 'Leaderboard' && (
          <div>
            <h2 className="sec-title">Leaderboard</h2>
            <div className="border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
              <p>Leaderboard will track predictor accuracy once trading begins. Connect wallet to participate.</p>
            </div>
          </div>
        )}

        {/* PORTFOLIO */}
        {activeTab === 'Portfolio' && (
          <div>
            <h2 className="sec-title">Portfolio</h2>
            <div className="border border-border rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Connect wallet to view your portfolio, positions, and points earned from trading volume.</p>
              <WalletButton />
            </div>
          </div>
        )}

        {/* ADMIN */}
        {activeTab === 'Admin' && (
          <div>
            <h2 className="sec-title">Admin</h2>
            <div className="border border-border rounded-2xl p-6 space-y-3 text-sm text-muted-foreground">
              <p>4 contracts deployed on 0G Mainnet. Admin functions available through smart contracts for moderators.</p>
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
          <span>OracleX AI on 0G Mainnet</span>
          <a href="https://github.com/Faisalsathu786/oraclex-ai" target="_blank" className="hover:text-foreground">GitHub</a>
        </div>
      </div>
    </div>
  )
}
