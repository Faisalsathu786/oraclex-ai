'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@/components/web3/Web3Provider'
import { CHAIN } from '@/lib/config'
import { formatEther, parseEther } from 'ethers'
import {
  fetchAllMarkets,
  fetchMarketOutcomes,
  MarketData,
  OutcomeData,
  MARKET_STATE_LABELS,
  getStateClass,
  getCategoryClass,
  getFactoryContract,
  getMarketContract,
  getRpcProvider,
  placeBet,
  claimReward,
  OWNER_WALLET,
  BetData,
} from '@/lib/contracts'
import {
  ArrowLeft,
  Clock,
  Users,
  TrendingUp,
  Loader2,
  AlertTriangle,
  Check,
  ExternalLink,
  Wallet,
  Coins,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Brain,
  Sparkles,
  Target,
  ThumbsUp,
  ThumbsDown,
  Info,
  MessageCircle,
  Activity,
  Trophy,
  Calendar,
  FileText,
} from 'lucide-react'

// ─── Helpers ───────────────────────────────────────────────────────

function getTimeRemaining(endTimestamp: bigint): string {
  const now = Math.floor(Date.now() / 1000)
  const remaining = Math.max(0, Number(endTimestamp) - now)
  if (remaining <= 0) return 'Ended'
  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const mins = Math.floor((remaining % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────

export default function MarketDetailPage() {
  const params = useParams()
  const marketIndex = Number(params.id)
  const { provider, signer, address, isConnected, connect } = useWallet()

  const [data, setData] = useState<MarketData | null>(null)
  const [marketAddress, setMarketAddress] = useState('')
  const [outcomes, setOutcomes] = useState<OutcomeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState('')
  const [placing, setPlacing] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [txStatus, setTxStatus] = useState('')
  const [userBet, setUserBet] = useState<BetData | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [descOpen, setDescOpen] = useState(false)

  const loadMarket = useCallback(async () => {
    if (isNaN(marketIndex)) return
    setLoading(true)
    setError('')
    try {
      const rpc = getRpcProvider()
      const factory = getFactoryContract(rpc)
      const addr: string = await factory.getMarket(marketIndex)
      if (!addr || addr === '0x0000000000000000000000000000000000000000') {
        setError('Market not found')
        setLoading(false)
        return
      }
      setMarketAddress(addr)

      const mc = getMarketContract(addr, rpc)
      const raw = await mc.market()
      const d: MarketData = {
        address: addr,
        id: raw.id,
        title: raw.title || '',
        description: raw.description || '',
        category: raw.category || '',
        imageUrl: raw.imageUrl || '',
        creator: raw.creator || '',
        state: Number(raw.state) as 0 | 1 | 2 | 3,
        endDate: raw.endDate,
        createdAt: raw.createdAt,
        totalVolume: raw.totalVolume,
        participantCount: raw.participantCount,
        winningOutcome: raw.winningOutcome,
        resolved: raw.resolved,
      }
      setData(d)

      const outcomes = await fetchMarketOutcomes(addr)
      setOutcomes(outcomes)
    } catch (e: any) {
      setError(e.message || 'Failed to load market')
    }
    setLoading(false)
  }, [marketIndex])

  useEffect(() => { loadMarket() }, [loadMarket])

  useEffect(() => {
    if (!marketAddress || !address) return
    const loadBet = async () => {
      try {
        const rpc = getRpcProvider()
        const mc = getMarketContract(marketAddress, rpc)
        const hb = await mc.hasBet(address)
        if (hb) {
          const raw = await mc.bets(address)
          setUserBet({ user: raw.user, outcomeIndex: raw.outcomeIndex, amount: raw.amount, claimedAt: raw.claimedAt })
        } else {
          setUserBet(null)
        }
      } catch { setUserBet(null) }
    }
    loadBet()
  }, [marketAddress, address])

  const handleClaim = async () => {
    if (!signer || !marketAddress) return
    setClaiming(true)
    setTxStatus('Claiming reward...')
    setTxHash('')
    try {
      const hash = await claimReward(marketAddress, signer)
      setTxHash(hash)
      setTxStatus('Reward claimed successfully!')
      const rpc = getRpcProvider()
      const mc = getMarketContract(marketAddress, rpc)
      const raw = await mc.bets(address!)
      setUserBet({ user: raw.user, outcomeIndex: raw.outcomeIndex, amount: raw.amount, claimedAt: raw.claimedAt })
      loadMarket()
    } catch (e: any) { setTxStatus(e.message?.slice(0, 100) || 'Claim failed') }
    setClaiming(false)
  }

  const handlePlaceBet = async () => {
    if (!signer || !marketAddress || selectedOutcome === null || !betAmount) return
    setPlacing(true)
    setTxStatus('Submitting bet...')
    setTxHash('')
    try {
      const hash = await placeBet(marketAddress, selectedOutcome, betAmount, signer)
      setTxHash(hash)
      setTxStatus('Bet placed successfully!')
      loadMarket()
    } catch (e: any) { setTxStatus(e.message?.slice(0, 100) || 'Transaction failed') }
    setPlacing(false)
  }

  const isOpen = data?.state === 1
  const isResolved = data?.state === 3
  const endDateStr = data?.endDate
    ? new Date(Number(data.endDate) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
  const timeRemaining = data?.endDate ? getTimeRemaining(data.endDate) : '—'
  const totalPool = outcomes.reduce((s, o) => s + o.pool, 0n)

  const getPayoutMultiplier = (outcomePool: bigint) => {
    if (totalPool === 0n || outcomePool === 0n) return '1.00x'
    return `${(Number(totalPool) / Number(outcomePool)).toFixed(2)}x`
  }

  // AI analysis derived from on-chain data
  const getAIAnalysis = () => {
    if (!data || outcomes.length < 2) return null
    const sorted = [...outcomes].map((o, i) => ({ ...o, index: i })).sort((a, b) => Number(b.pool - a.pool))
    const leader = sorted[0]
    const leaderPct = totalPool > 0n ? Number(leader.pool * 100n / totalPool) : 50
    const confidence = Math.min(95, Math.round(leaderPct + 10))
    const riskLevel = leaderPct > 80 ? 'Low' : leaderPct > 60 ? 'Medium' : 'High'
    return {
      probability: Math.round(leaderPct),
      confidence,
      leader: leader.name,
      leaderIndex: leader.index,
      riskLevel,
      bullCase: `Market sentiment strongly favors "${leader.name}" with ${Math.round(leaderPct)}% of total liquidity. ${data.participantCount > 0n ? `${data.participantCount} participants have weighed in.` : ''} The consensus is clear based on capital allocation.`,
      bearCase: `${sorted[sorted.length - 1]?.name || 'The alternative'} holds only ${totalPool > 0n ? Math.round(Number((sorted[sorted.length - 1]?.pool || 0n) * 100n / totalPool)) : 0}% of the pool. For contrarians, the payout multiplier of ${getPayoutMultiplier(sorted[sorted.length - 1]?.pool || 0n)} offers significant upside if the unexpected occurs.`,
    }
  }

  const ai = getAIAnalysis()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center">
            <Wallet size={28} className="text-purple-400" />
          </div>
          <h2 className="text-lg font-bold mb-2">Connect Wallet</h2>
          <p className="text-zinc-500 text-sm mb-6">Connect your wallet to view and bet on prediction markets</p>
          <button onClick={connect} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="border-b border-zinc-800 bg-black/80 backdrop-blur-xl sticky top-14 sm:top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Markets
          </Link>
          {data && <span className="text-zinc-700">/</span>}
          {data && <span className="text-sm text-zinc-300 truncate">{data.title}</span>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin mx-auto mb-4 text-purple-400" />
              <p className="text-sm text-zinc-500">Loading market data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-32">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <p className="text-zinc-400 text-lg mb-2">Market Not Found</p>
            <p className="text-zinc-600 text-sm mb-6">{error}</p>
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors">
              <ArrowLeft size={14} /> Back to Markets
            </Link>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* ─── LEFT COLUMN ───────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* SECTION 1 — Market Header */}
              <div className="glass-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${getCategoryClass(data.category)}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    {data.category}
                  </span>
                  <span className={`badge ${getStateClass(data.state)}`}>
                    {MARKET_STATE_LABELS[data.state as 0|1|2|3|4] || 'Unknown'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">{data.title}</h1>

                {data.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img src={data.imageUrl} alt={data.title} className="w-full h-44 sm:h-56 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
                  <Calendar size={13} className="text-amber-400" />
                  <span>Resolution: {endDateStr}</span>
                  <span className="text-zinc-700">·</span>
                  <Shield size={13} className="text-purple-400" />
                  <span>Source: On-Chain</span>
                </div>
              </div>

              {/* SECTION 2 — Market Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="stat-card">
                  <TrendingUp size={16} className="mx-auto mb-1.5 text-purple-400" />
                  <div className="text-lg sm:text-xl font-bold tabular-nums">{Number(formatEther(data.totalVolume)).toFixed(1)}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Volume (0G)</div>
                </div>
                <div className="stat-card">
                  <Users size={16} className="mx-auto mb-1.5 text-blue-400" />
                  <div className="text-lg sm:text-xl font-bold">{Number(data.participantCount)}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Participants</div>
                </div>
                <div className="stat-card">
                  <Clock size={16} className="mx-auto mb-1.5 text-amber-400" />
                  <div className="text-lg sm:text-xl font-bold">{timeRemaining}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Time Left</div>
                </div>
                <div className="stat-card">
                  <Activity size={16} className="mx-auto mb-1.5 text-emerald-400" />
                  <div className="text-lg sm:text-xl font-bold">{MARKET_STATE_LABELS[data.state as 0|1|2|3|4] || '—'}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Status</div>
                </div>
                <div className="stat-card">
                  <Calendar size={16} className="mx-auto mb-1.5 text-purple-400" />
                  <div className="text-[10px] sm:text-xs font-semibold leading-tight">{endDateStr}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Resolution Date</div>
                </div>
                <div className="stat-card">
                  <Coins size={16} className="mx-auto mb-1.5 text-cyan-400" />
                  <div className="text-lg sm:text-xl font-bold tabular-nums">{Number(formatEther(totalPool)).toFixed(1)}</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Liquidity (0G)</div>
                </div>
              </div>

              {/* SECTION 3 — Outcomes Panel */}
              <div className="glass-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Outcomes</h2>
                  <span className="text-xs text-zinc-600">{outcomes.length} options</span>
                </div>
                {outcomes.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600 text-sm">No outcomes loaded</div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {outcomes.map((o, i) => {
                      const poolPct = totalPool > 0n ? Math.round(Number(o.pool * 10000n) / Number(totalPool)) / 100 : 0
                      const isSelected = selectedOutcome === i
                      const isWinner = isResolved && Number(data.winningOutcome) === i
                      return (
                        <div
                          key={i}
                          onClick={() => isOpen && !placing && setSelectedOutcome(i)}
                          className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? 'outcome-card-selected'
                              : isWinner
                              ? 'border-emerald-500/40 bg-emerald-500/5'
                              : 'outcome-card'
                          } ${!isOpen && !isWinner ? 'opacity-70' : ''}`}
                        >
                          {/* Progress bar */}
                          <div
                            className={`absolute bottom-0 left-0 h-0.5 transition-all duration-700 rounded-full ${
                              isSelected ? 'bg-gradient-to-r from-purple-500 to-blue-500' : isWinner ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                            style={{ width: `${Math.max(2, poolPct)}%` }}
                          />

                          <div className="p-4 sm:p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${
                                  isSelected ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : isWinner ? 'bg-emerald-400' : 'bg-zinc-600'
                                }`} />
                                <h3 className="text-sm font-semibold truncate">{o.name || `Outcome ${i + 1}`}</h3>
                              </div>
                              {isWinner && <Trophy size={14} className="text-emerald-400 flex-shrink-0" />}
                              {isSelected && <Sparkles size={14} className="text-purple-400 flex-shrink-0 animate-pulse" />}
                            </div>

                            {/* Probability bar */}
                            <div className="progress-bar mb-3">
                              <div className="progress-fill-purple" style={{ width: `${Math.max(3, poolPct)}%` }} />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Probability</span>
                                <span className={`font-bold tabular-nums ${poolPct >= 70 ? 'prob-high' : poolPct >= 40 ? 'prob-mid' : 'prob-low'}`}>{poolPct.toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Pool</span>
                                <span className="text-zinc-300 tabular-nums">{Number(formatEther(o.pool)).toFixed(2)} 0G</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Payout</span>
                                <span className={`font-medium tabular-nums ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>{getPayoutMultiplier(o.pool)}</span>
                              </div>
                            </div>

                            {isOpen && (
                              <button
                                className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/25'
                                    : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300 group-hover:bg-zinc-700'
                                }`}
                              >
                                {isSelected ? 'Selected ✓' : 'Select Outcome'}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 5 — AI Analysis */}
              {ai && (
                <div className="glass-card p-5 sm:p-6 border-purple-500/10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Brain size={16} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-300">AI Analysis</h2>
                      <p className="text-xs text-zinc-600">Powered by 0G Compute</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Target size={14} className="text-purple-400" />
                        <span className="text-xs font-medium text-zinc-400">Probability Score</span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">{ai.probability}%</span>
                        <span className="text-sm text-zinc-600 mb-1">{ai.leader}</span>
                      </div>
                      <div className="mt-2 w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700" style={{ width: `${ai.probability}%` }} />
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={14} className="text-blue-400" />
                        <span className="text-xs font-medium text-zinc-400">Confidence</span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">{ai.confidence}%</span>
                      </div>
                      <div className="mt-2 w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700" style={{ width: `${ai.confidence}%` }} />
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={14} className={ai.riskLevel === 'Low' ? 'text-emerald-400' : ai.riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'} />
                        <span className="text-xs font-medium text-zinc-400">Risk Level</span>
                      </div>
                      <span className={`text-2xl font-bold ${ai.riskLevel === 'Low' ? 'text-emerald-400' : ai.riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'}`}>{ai.riskLevel}</span>
                      <p className="text-xs text-zinc-600 mt-1">Based on pool concentration</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/30 rounded-xl p-4 border border-emerald-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsUp size={14} className="text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Bull Case</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{ai.bullCase}</p>
                    </div>
                    <div className="bg-zinc-900/30 rounded-xl p-4 border border-red-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsDown size={14} className="text-red-400" />
                        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Bear Case</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{ai.bearCase}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6 — Description */}
              {data.description && (
                <div className="glass-card overflow-hidden">
                  <button
                    onClick={() => setAccordionOpen(!accordionOpen)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-zinc-500" />
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-zinc-300">Market Description</h3>
                        <p className="text-xs text-zinc-600">Full details and context</p>
                      </div>
                    </div>
                    {descOpen ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
                  </button>
                  {descOpen && (
                    <div className="px-5 sm:px-6 pb-6 border-t border-zinc-800/50 pt-4 animate-in slide-in-from-top">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{data.description}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 pt-3 border-t border-zinc-800/50">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/50">
                          <Users size={12} /> Creator {data.creator.slice(0, 6)}...{data.creator.slice(-4)}
                        </span>
                        <a href={`${CHAIN.explorerUrl}/address/${data.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 hover:text-purple-400 transition-colors">
                          <ExternalLink size={12} /> View Contract
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 7 — Resolution Info */}
              <div className="glass-card overflow-hidden">
                <button
                  onClick={() => setAccordionOpen(!accordionOpen)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-zinc-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Info size={16} className="text-zinc-500" />
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-zinc-300">Resolution Information</h3>
                      <p className="text-xs text-zinc-600">Criteria, sources, and rules</p>
                    </div>
                  </div>
                  {accordionOpen ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
                </button>
                {accordionOpen && (
                  <div className="px-5 sm:px-6 pb-6 space-y-4 border-t border-zinc-800/50 pt-4 animate-in slide-in-from-top">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Resolution Criteria</h4>
                      <p className="text-sm text-zinc-400">The market resolves based on the outcome selected by the platform moderator after the event end date. Moderators verify results against official sources and public data.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                        <h4 className="text-xs font-semibold text-zinc-400 mb-2">Resolution Source</h4>
                        <p className="text-sm text-zinc-500">On-chain moderator consensus via 0G Mainnet smart contracts</p>
                      </div>
                      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                        <h4 className="text-xs font-semibold text-zinc-400 mb-2">Data Providers</h4>
                        <p className="text-sm text-zinc-500">OracleX Access Manager · 0G Chain · Public APIs</p>
                      </div>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={13} className="text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">Important</span>
                      </div>
                      <p className="text-xs text-zinc-500">Once resolved, the winning outcome is immutable on 0G chain. All rewards are distributed automatically through smart contracts.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 8 — Activity Feed */}
              <div className="glass-card p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MessageCircle size={16} className="text-zinc-500" />
                  <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Activity Feed</h2>
                </div>
                {data.participantCount > 0n ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Activity size={14} className="text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-300"><span className="text-purple-400 font-medium">{Number(data.participantCount)} participants</span> have placed bets on this market</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">Total volume: {Number(formatEther(data.totalVolume)).toFixed(2)} 0G</p>
                      </div>
                    </div>
                    {isResolved && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Trophy size={14} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-300">Market resolved — Winner: <span className="text-emerald-400 font-medium">{outcomes[Number(data.winningOutcome)]?.name || `#${Number(data.winningOutcome) + 1}`}</span></p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">Winners can now claim their rewards</p>
                        </div>
                      </div>
                    )}
                    {!isResolved && isOpen && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Zap size={14} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-300">Market is active and accepting bets</p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">Place your prediction before the market closes</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity size={32} className="mx-auto mb-3 text-zinc-700" />
                    <p className="text-sm text-zinc-600">No activity yet</p>
                    <p className="text-xs text-zinc-700 mt-1">Be the first to place a bet</p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── RIGHT COLUMN — Betting Panel ──────────────────────── */}
            <div className="lg:col-span-1">
              <div className="glass-card p-5 sm:p-6 sticky top-[calc(3.5rem+3rem)] sm:top-[calc(4rem+3rem)] border-zinc-700/50">

                {/* User Bet Badge */}
                {userBet && (
                  <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/15">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Your Position</p>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{outcomes[Number(userBet.outcomeIndex)]?.name || `#${Number(userBet.outcomeIndex) + 1}`}</span>
                      <span className="text-sm font-bold tabular-nums">{formatEther(userBet.amount)} 0G</span>
                    </div>
                    {userBet.claimedAt > 0n && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg w-fit">
                        <Check size={11} /> Claimed
                      </div>
                    )}
                  </div>
                )}

                {/* Not Open State */}
                {!isOpen && !isResolved && data.state !== 4 && (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Clock size={24} className="text-amber-400" />
                    </div>
                    <p className="text-sm font-medium text-zinc-400">Betting {data.state === 0 ? 'Not Yet Open' : 'Closed'}</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {data.state === 0 ? 'This market is pending moderator approval' : 'This market has closed for betting'}
                    </p>
                  </div>
                )}

                {/* Cancelled */}
                {data.state === 4 && (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertTriangle size={24} className="text-red-400" />
                    </div>
                    <p className="text-sm font-medium text-red-400">Market Cancelled</p>
                    {userBet && (
                      <p className="text-xs text-zinc-600 mt-2">
                        Your {formatEther(userBet.amount)} 0G bet on &quot;{outcomes[Number(userBet.outcomeIndex)]?.name}&quot; is locked. Contact admin for resolution.
                      </p>
                    )}
                  </div>
                )}

                {/* Resolved — Claim */}
                {isResolved && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Trophy size={24} className="text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-300">Market Resolved</p>
                      <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">
                          {outcomes[Number(data.winningOutcome)]?.name || `Outcome #${Number(data.winningOutcome) + 1}`}
                        </span>
                      </div>
                    </div>

                    {userBet && Number(userBet.outcomeIndex) === Number(data.winningOutcome) && userBet.claimedAt === 0n && (
                      <button
                        onClick={handleClaim}
                        disabled={claiming || !signer}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-emerald-500/20"
                      >
                        {claiming ? (
                          <span className="flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" /> Claiming Reward...</span>
                        ) : 'Claim Reward'}
                      </button>
                    )}

                    {userBet && Number(userBet.outcomeIndex) !== Number(data.winningOutcome) && (
                      <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <ThumbsDown size={18} className="mx-auto mb-2 text-red-400" />
                        <p className="text-xs text-zinc-400">You predicted {outcomes[Number(userBet.outcomeIndex)]?.name}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">The outcome was different</p>
                      </div>
                    )}

                    {userBet && Number(userBet.outcomeIndex) === Number(data.winningOutcome) && userBet.claimedAt > 0n && (
                      <div className="text-center p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <Check size={18} className="mx-auto mb-1 text-emerald-400" />
                        <p className="text-sm font-medium text-emerald-400">Reward Claimed ✓</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Open — Place Bet */}
                {isOpen && (
                  <>
                    <h3 className="text-sm font-semibold mb-1">Place Bet</h3>
                    <p className="text-xs text-zinc-500 mb-5">Selected outcome will determine your payout</p>

                    {/* Selected Outcome */}
                    <div className="mb-4">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Selected Outcome</label>
                      {selectedOutcome !== null ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                          <span className="text-sm font-medium text-purple-300">{outcomes[selectedOutcome]?.name}</span>
                          <Sparkles size={14} className="text-purple-400" />
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-xs text-zinc-600 text-center">
                          Select an outcome from the panel
                        </div>
                      )}
                    </div>

                    {/* Amount Input */}
                    <div className="mb-4">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Bet Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          placeholder="0.00"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all pr-14"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">0G</span>
                      </div>
                      {betAmount && (
                        <div className="mt-2 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Pool Share</span>
                            <span className="text-zinc-300 font-medium tabular-nums">
                              {selectedOutcome !== null && totalPool > 0n
                                ? `${(Number(outcomes[selectedOutcome]?.pool || 0n) * 100 / Number(totalPool)).toFixed(1)}%`
                                : '—'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Est. Payout</span>
                            <span className="text-emerald-400 font-semibold tabular-nums">
                              {selectedOutcome !== null && betAmount && outcomes[selectedOutcome]
                                ? `${(Number(betAmount) * Number(totalPool) / Math.max(1, Number(outcomes[selectedOutcome].pool))).toFixed(3)} 0G`
                                : '—'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Payout Multiplier</span>
                            <span className="text-zinc-300 font-medium tabular-nums">
                              {selectedOutcome !== null ? getPayoutMultiplier(outcomes[selectedOutcome]?.pool || 0n) : '—'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Button */}
                    <button
                      onClick={handlePlaceBet}
                      disabled={selectedOutcome === null || !betAmount || !signer || placing}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 mb-3"
                    >
                      {placing ? (
                        <span className="flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" /> Confirming...</span>
                      ) : selectedOutcome !== null ? (
                        `Bet on ${outcomes[selectedOutcome]?.name || '...'}`
                      ) : (
                        'Select an Outcome'
                      )}
                    </button>

                    {/* TX Status */}
                    {txStatus && (
                      <div className={`px-3 py-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        txStatus.includes('success') || txStatus.includes('Bet placed')
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : txStatus.includes('Error') || txStatus.includes('failed')
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {txStatus.includes('Error') ? <AlertTriangle size={12} /> : txStatus.includes('success') || txStatus.includes('Bet placed') ? <Check size={12} /> : <Loader2 size={12} className="animate-spin" />}
                        <span className="flex-1">{txStatus}</span>
                      </div>
                    )}

                    {txHash && (
                      <a href={`${CHAIN.explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                        <ExternalLink size={12} /> View on Explorer
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
