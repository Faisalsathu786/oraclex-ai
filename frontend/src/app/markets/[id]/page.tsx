'use client'

import { useState } from 'react'
import { ArrowLeft, Shield, Brain, BarChart3, Clock, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function MarketDetailPage() {
  const [betAmount, setBetAmount] = useState('')
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | null>(null)
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/markets" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Markets
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-purple-900/50 to-blue-900/50 flex items-center justify-center">
              <div className="text-8xl font-bold text-white/10">BTC</div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-primary">Crypto</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> Closes Dec 31, 2026</span>
              </div>
              <h1 className="text-2xl font-bold mb-4">Will BTC reach $200,000 before Dec 2026?</h1>
              <p className="text-muted-foreground mb-4">
                Prediction market for Bitcoin price reaching the $200,000 milestone by the end of 2026.
                Resolution will be based on CoinMarketCap price data at market close.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users size={14} /> 1.2K participants</span>
                <span className="flex items-center gap-1"><TrendingUp size={14} /> $1.2M volume</span>
              </div>
            </div>
          </motion.div>

          {/* AI Analysis Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 gradient-border">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">AI Analysis</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Probability Estimate</span>
                  <span className="text-sm text-muted-foreground">Confidence: 78%</span>
                </div>
                <div className="text-4xl font-bold text-primary mb-6">67%</div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-success mb-1">Bull Case</h4>
                    <p className="text-sm text-muted-foreground">Strong institutional demand through ETFs. Bitcoin halving supply shock. Growing adoption in emerging markets.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-destructive mb-1">Bear Case</h4>
                    <p className="text-sm text-muted-foreground">Regulatory uncertainty. Macroeconomic headwinds from interest rates. Competition from other crypto assets.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="glass-card p-4 mb-4">
                  <h4 className="text-sm font-medium mb-3">Risk Assessment</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Volatility Risk</span><span className="text-warning">Medium</span></div>
                      <div className="h-2 bg-secondary rounded-full"><div className="h-full w-2/3 bg-warning rounded-full" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Market Sentiment</span><span className="text-success">Bullish</span></div>
                      <div className="h-2 bg-secondary rounded-full"><div className="h-full w-3/4 bg-success rounded-full" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Regulatory Risk</span><span className="text-destructive">Elevated</span></div>
                      <div className="h-2 bg-secondary rounded-full"><div className="h-full w-1/3 bg-destructive rounded-full" /></div>
                    </div>
                  </div>
                </div>

                {/* AI Debate Mode */}
                <div className="glass-card p-4">
                  <h4 className="text-sm font-medium mb-3">AI Debate Mode</h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                      <span className="font-semibold text-success">Bull Agent: </span>
                      <span className="text-muted-foreground">Strong on-chain metrics and ETF inflows indicate continued upward momentum.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <span className="font-semibold text-destructive">Bear Agent: </span>
                      <span className="text-muted-foreground">Historical patterns suggest potential correction before new highs are reached.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                  <Shield size={12} /> AI analysis powered by 0G Compute
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trading Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Trade</h2>

            {/* Buy/Sell Tabs */}
            <div className="grid grid-cols-2 gap-0 mb-4 bg-secondary rounded-xl p-1">
              <button
                onClick={() => setActiveTab('buy')}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'buy' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'sell' ? 'bg-destructive text-white' : 'text-muted-foreground'
                }`}
              >
                Sell
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSelectedOutcome('YES')}
                className={`p-4 rounded-xl text-center font-semibold transition-all ${
                  selectedOutcome === 'YES'
                    ? 'bg-success/20 border-2 border-success text-success'
                    : 'bg-secondary border-2 border-transparent hover:border-success/50'
                }`}
              >
                <div className="text-2xl">67%</div>
                <div className="text-sm mt-1">YES</div>
                <div className="text-xs text-muted-foreground mt-0.5">$0.67/share</div>
              </button>
              <button
                onClick={() => setSelectedOutcome('NO')}
                className={`p-4 rounded-xl text-center font-semibold transition-all ${
                  selectedOutcome === 'NO'
                    ? 'bg-destructive/20 border-2 border-destructive text-destructive'
                    : 'bg-secondary border-2 border-transparent hover:border-destructive/50'
                }`}
              >
                <div className="text-2xl">33%</div>
                <div className="text-sm mt-1">NO</div>
                <div className="text-xs text-muted-foreground mt-0.5">$0.33/share</div>
              </button>
            </div>

            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={betAmount}
                  onChange={e => setBetAmount(e.target.value)}
                  className="input-field pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">USDC</span>
              </div>
            </div>

            <button className={`w-full py-3 rounded-xl font-semibold mb-4 transition-all ${
              activeTab === 'buy'
                ? 'bg-success text-white hover:opacity-90'
                : 'bg-destructive text-white hover:opacity-90'
            }`} disabled={!selectedOutcome || !betAmount}>
              {activeTab === 'buy'
                ? (selectedOutcome ? `Buy ${selectedOutcome} Shares` : 'Select Outcome')
                : (selectedOutcome ? `Sell ${selectedOutcome} Shares` : 'Select Outcome')
              }
            </button>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Your Balance</span><span className="text-white font-medium">10,000 USDC</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Est. Shares</span><span className="text-white font-medium">{betAmount ? Number(betAmount) / (selectedOutcome === 'YES' ? 0.67 : 0.33) : '--'}</span></div>
              {activeTab === 'sell' && (
                <div className="flex justify-between text-warning"><span>Sell Tax (2.5%)</span><span className="text-white font-medium">{betAmount ? (Number(betAmount) * 0.025).toFixed(2) : '--'} USDC</span></div>
              )}
              {activeTab === 'buy' && (
                <div className="flex justify-between text-success"><span>Buy Fee</span><span className="text-white font-medium">FREE</span></div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users size={12} /> YES Pool: $800K</span>
                <span className="flex items-center gap-1"><Users size={12} /> NO Pool: $400K</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
