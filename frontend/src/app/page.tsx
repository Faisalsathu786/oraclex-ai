'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useWallet } from '@/components/web3/Web3Provider'
import { WalletButton } from '@/components/web3/WalletButton'
import { CONTRACTS, CHAIN } from '@/lib/config'
import { formatEther, parseEther, Contract } from 'ethers'
import {
  fetchAllMarkets,
  fetchMarketOutcomes,
  fetchUserBet,
  placeBet,
  claimReward,
  isOwner,
  isSuperAdmin,
  OWNER_WALLET,
  CATEGORIES,
  MARKET_STATE_LABELS,
  getStateClass,
  getCategoryClass,
  getProbBarClass,
  MarketData,
  OutcomeData,
  BetData,
  getAccessManagerContract,
  getTreasuryContract,
  getFactoryContract,
  getMarketContract,
  getRpcProvider,
} from '@/lib/contracts'
import {
  BarChart3,
  Users,
  Trophy,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Search,
  Medal,
  Check,
  AlertTriangle,
  Wallet,
  ExternalLink,
  Award,
  Flag,
  Settings,
  Gavel,
  Loader2,
  ArrowRight,
  Link as LinkIcon,
  ImageIcon,
  X,
  LogOut,
  UserCheck,
  UserX,
  PauseCircle,
  PlayCircle,
  Coins,
  List,
} from 'lucide-react'
import { useTab } from '@/lib/tab-context'

// ─── LANDING PAGE ──────────────────────────────────────────────────

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center hero-glow px-4 sm:px-6">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-6 shadow-glow">
          <span className="text-xl sm:text-2xl font-bold text-white">X</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 gradient-text">OracleX AI</h1>
        <p className="text-zinc-400 text-base sm:text-lg mb-2 leading-relaxed px-2">
          Decentralized prediction markets powered by AI on 0G
        </p>
        <p className="text-zinc-600 text-xs sm:text-sm mb-8 sm:mb-10">
          Predict real-world outcomes, earn rewards, and climb the leaderboard
        </p>
        <WalletButton onConnect={() => {}} />
        <div className="mt-10 sm:mt-12 flex justify-center gap-4 sm:gap-8 text-xs text-zinc-600 flex-wrap">
          <span>Powered by 0G</span>
          <span className="text-zinc-700 hidden sm:inline">·</span>
          <a href="https://chainscan.0g.ai" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">
            Explorer
          </a>
          <span className="text-zinc-700 hidden sm:inline">·</span>
          <span>On-Chain Markets</span>
        </div>
      </div>
    </div>
  )
}

// ─── MARKET LIST ────────────────────────────────────────────────────

function StateBadge({ state }: { state: number }) {
  const s = state as 0 | 1 | 2 | 3 | 4
  const label = MARKET_STATE_LABELS[s] || 'Unknown'
  const cls = getStateClass(state)
  return <span className={`badge ${cls}`}>{label}</span>
}

function MarketsTab() {
  const { provider, address } = useWallet()
  const [markets, setMarkets] = useState<{ address: string; data: MarketData }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async () => {
    if (!provider) return
    setLoading(true)
    setError('')
    try {
      const m = await fetchAllMarkets()
      m.sort((a, b) => Number(b.data.createdAt - a.data.createdAt))
      setMarkets(m)
    } catch (e: any) {
      setError(e.message || 'Failed to load markets')
    }
    setLoading(false)
  }, [provider])

  useEffect(() => { load() }, [load])

  const filtered = markets.filter((m) => {
    if (filter !== 'All' && m.data.category !== filter) return false
    if (searchQuery && !m.data.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider">Markets</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 py-2 text-sm w-full"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === c
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-300 bg-zinc-800/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading markets...
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-20 text-red-400">
          <AlertTriangle size={18} className="mr-2" /> {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <BarChart3 size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No markets found</p>
          {address && isOwner(address) && (
            <Link href="/create" className="mt-4 btn-primary text-xs">
              Create the first market
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => (
            <Link key={m.address} href={`/markets/${Number(m.data.id)}`}>
              <div className="market-card group h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <StateBadge state={m.data.state} />
                    <span className={`badge ${getCategoryClass(m.data.category)}`}>{m.data.category}</span>
                  </div>
                  <p className="text-sm font-medium text-white line-clamp-2 mb-4 leading-snug group-hover:text-purple-300 transition-colors">{m.data.title}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600 pt-3 border-t border-zinc-800">
                  <span className="flex items-center gap-1.5">
                    <Users size={12} />
                    {Number(m.data.participantCount)} bettors
                  </span>
                  <span className="font-mono tabular-nums text-zinc-400">
                    {Number(m.data.totalVolume) > 0 ? `${Number(formatEther(m.data.totalVolume)).toFixed(1)} 0G` : '—'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── LEADERBOARD ────────────────────────────────────────────────────

function LeaderboardTab() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Leaderboard</h2>
      <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
        <Trophy size={48} className="mb-4 opacity-30" />
        <p className="text-sm text-zinc-500 mb-1">Leaderboard coming soon</p>
        <p className="text-xs text-zinc-600">Rankings will be calculated from on-chain prediction data</p>
      </div>
    </div>
  )
}

// ─── PORTFOLIO ──────────────────────────────────────────────────────

function PortfolioTab() {
  const { provider, address, signer } = useWallet()
  const [balance, setBalance] = useState('0')
  const [bets, setBets] = useState<{ market: string; address: string; data: MarketData; outcomeIndex: number; outcomeName: string; amount: bigint; pool: bigint; totalPool: bigint; claimedAt: bigint }[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingAddr, setClaimingAddr] = useState<string | null>(null)
  const [claimMsg, setClaimMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!address) return
      setLoading(true)
      try {
        // Fetch wallet balance via RPC
        const rpc = getRpcProvider()
        try {
          const bal = await rpc.getBalance(address)
          setBalance(Number(formatEther(bal)).toFixed(4))
        } catch {}

        const all = await fetchAllMarkets()
        const userBets: typeof bets = []

        for (const m of all) {
          const bet = await fetchUserBet(m.address, address)
          if (bet && bet.amount > 0n) {
            const outcomes = await fetchMarketOutcomes(m.address)
            const oidx = Number(bet.outcomeIndex)
            const outcomeName = outcomes[oidx]?.name || `Outcome ${oidx + 1}`
            const outcomePool = outcomes[oidx]?.pool || 0n
            const totalPool = outcomes.reduce((s, o) => s + o.pool, 0n)
            userBets.push({
              market: m.data.title,
              address: m.address,
              data: m.data,
              outcomeIndex: oidx,
              outcomeName,
              amount: bet.amount,
              pool: outcomePool,
              totalPool,
              claimedAt: bet.claimedAt,
            })
          }
        }
        setBets(userBets)
      } catch (e) {
        console.error('Portfolio load error', e)
      }
      setLoading(false)
    }
    load()
  }, [address])

  const totalInvested = bets.reduce((s, b) => s + Number(formatEther(b.amount)), 0)
  const openBets = bets.filter(b => b.data.state === 1)
  const resolvedBets = bets.filter(b => b.data.state === 3)
  const pendingBets = bets.filter(b => b.data.state === 0 || b.data.state === 2)

  const getOdds = (pool: bigint, totalPool: bigint): string => {
    if (totalPool === 0n) return '0'
    return (Number(pool) * 100 / Number(totalPool)).toFixed(1)
  }

  const getPotentialWin = (amount: bigint, pool: bigint, totalPool: bigint): string => {
    if (totalPool === 0n || pool === 0n) return '0'
    const win = (Number(formatEther(amount)) * Number(totalPool)) / Number(pool)
    return win.toFixed(4)
  }

  const handleClaim = async (marketAddress: string) => {
    if (!signer) return
    setClaimingAddr(marketAddress)
    setClaimMsg('')
    try {
      await claimReward(marketAddress, signer)
      setClaimMsg('claimed')
      setTimeout(() => {
        setBets(prev => prev.map(b => {
          if (b.address === marketAddress) {
            return { ...b, claimedAt: 1n }
          }
          return b
        }))
        setClaimingAddr(null)
        setClaimMsg('')
      }, 1500)
    } catch (e: any) {
      setClaimMsg(e.message?.slice(0, 80) || 'Claim failed')
      setTimeout(() => {
        setClaimingAddr(null)
        setClaimMsg('')
      }, 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading portfolio...
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Portfolio</h2>

      {/* Balance + Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Wallet Balance</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{balance}</div>
          <div className="text-xs text-zinc-600 mt-1">0G Tokens</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Invested</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{totalInvested.toFixed(4)}</div>
          <div className="text-xs text-zinc-600 mt-1">0G Tokens</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Open Positions</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{openBets.length}</div>
          <div className="text-xs text-zinc-600 mt-1">Active bets</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Resolved</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{resolvedBets.length}</div>
          <div className="text-xs text-zinc-600 mt-1">Claimable</div>
        </div>
      </div>

      {bets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <Wallet size={48} className="mb-4 opacity-20" />
          <p className="text-sm text-zinc-500 font-medium">No positions yet</p>
          <p className="text-xs text-zinc-600 mt-1">Start betting on prediction markets to build your portfolio</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Open Positions */}
          {openBets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Open Positions</h3>
              <div className="space-y-3">
                {openBets.map((b) => {
                  const odds = getOdds(b.pool, b.totalPool)
                  const winAmount = getPotentialWin(b.amount, b.pool, b.totalPool)
                  return (
                    <div key={b.address} className="glass-card p-4 sm:p-5 rounded-2xl hover:border-zinc-700 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{b.market}</p>
                          <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              {b.outcomeName}
                            </span>
                            <span className="text-xs text-zinc-600">{odds}% pool share</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold tabular-nums text-white">{formatEther(b.amount)} <span className="text-xs font-normal text-zinc-500">0G</span></div>
                          <div className="text-xs text-zinc-600 mt-1">
                            <span className="text-zinc-500">Potential win</span>
                            <span className="text-emerald-400 font-medium ml-1 tabular-nums">{winAmount} 0G</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pending/Locked */}
          {pendingBets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Pending & Locked</h3>
              <div className="space-y-2">
                {pendingBets.map((b) => (
                  <div key={b.address} className="glass-card p-4 rounded-2xl flex items-center justify-between opacity-70">
                    <div className="flex items-center gap-3 min-w-0">
                      <StateBadge state={b.data.state} />
                      <span className="text-sm text-zinc-300 truncate">{b.market}</span>
                      <span className="text-xs text-zinc-600">{b.outcomeName}</span>
                    </div>
                    <span className="text-sm font-mono text-zinc-400 tabular-nums flex-shrink-0">{formatEther(b.amount)} 0G</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved */}
          {resolvedBets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Resolved</h3>
              <div className="space-y-2">
                {resolvedBets.map((b) => {
                  const won = Number(b.data.winningOutcome) === b.outcomeIndex
                  const isClaiming = claimingAddr === b.address
                  const isClaimed = b.claimedAt > 0n
                  return (
                    <div key={b.address} className={`glass-card p-4 rounded-2xl flex flex-col border ${won ? 'border-emerald-500/30' : 'border-red-500/20'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${won ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {won ? 'Won' : 'Lost'}
                          </span>
                          <span className="text-sm text-zinc-300 truncate">{b.market}</span>
                          <span className="text-xs text-zinc-500">{b.outcomeName}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-mono text-zinc-400 tabular-nums">{formatEther(b.amount)} 0G</span>
                          {won && <div className="text-xs text-emerald-400 font-medium">{getPotentialWin(b.amount, b.pool, b.totalPool)} 0G payout</div>}
                        </div>
                      </div>
                      {won && !isClaimed && (
                        <div className="mt-3 pt-3 border-t border-zinc-800">
                          {claimMsg && isClaiming ? (
                            <div className={`text-xs flex items-center gap-2 ${claimMsg === 'claimed' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {claimMsg === 'claimed' ? <Check size={12} /> : <AlertTriangle size={12} />}
                              {claimMsg === 'claimed' ? 'Claimed!' : claimMsg}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleClaim(b.address)}
                              disabled={isClaiming}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40"
                            >
                              {isClaiming ? (
                                <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Claiming...</span>
                              ) : (
                                'Claim Reward'
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      {won && isClaimed && (
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-1.5 text-xs text-emerald-400">
                          <Check size={12} /> Reward claimed
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ADMIN PANEL ────────────────────────────────────────────────────

const ADMIN_TABS = ['Overview', 'Markets', 'Users', 'Treasury', 'Settings']

function AdminPanel() {
  const { provider, signer, address } = useWallet()
  const [tab, setTab] = useState('Overview')
  const [marketCount, setMarketCount] = useState(0)
  const [treasuryStats, setTreasuryStats] = useState<[bigint, bigint, bigint]>([0n, 0n, 0n])
  const [protocolFee, setProtocolFee] = useState<bigint>(0n)
  const [paused, setPaused] = useState(false)
  const [markets, setMarkets] = useState<{ address: string; data: MarketData }[]>([])
  const [loading, setLoading] = useState(true)
  const [userAddress, setUserAddress] = useState('')
  const [isMod, setIsMod] = useState<boolean | null>(null)
  const [txStatus, setTxStatus] = useState('')
  const [feeInput, setFeeInput] = useState('')
  const [resolvingAddr, setResolvingAddr] = useState<string | null>(null)
  const [resolveOutcome, setResolveOutcome] = useState<number | null>(null)
  const [outcomesCache, setOutcomesCache] = useState<Record<string, OutcomeData[]>>({})

  const loadData = useCallback(async () => {
    if (!provider || !address || !isOwner(address)) return
    setLoading(true)
    try {
      const factory = getFactoryContract(provider)
      try {
        const count = await factory.marketCount()
        setMarketCount(Number(count))
      } catch { /* ignore */ }

      const all = await fetchAllMarkets()
      setMarkets(all)

      try {
        const treasury = getTreasuryContract(provider)
        const stats = await treasury.getStats()
        setTreasuryStats(stats)
      } catch { /* ignore */ }

      try {
        const ac = getAccessManagerContract(provider)
        const fee = await ac.protocolFee()
        setProtocolFee(fee)
        setFeeInput(formatEther(fee))
        const p = await ac.paused()
        setPaused(p)
      } catch { /* ignore */ }
    } catch (e) {
      console.error('Admin load error', e)
    }
    setLoading(false)
  }, [provider, address])

  useEffect(() => { loadData() }, [loadData])

  if (!address || !isOwner(address)) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <Shield size={24} className="mr-2" /> Admin access restricted to platform owner
      </div>
    )
  }

  const checkMod = async () => {
    if (!provider || !userAddress) return
    try {
      const ac = getAccessManagerContract(provider)
      const mod = await ac.isModerator(userAddress)
      setIsMod(mod)
    } catch {
      setIsMod(false)
    }
  }

  const approveMarket = async (marketAddr: string) => {
    if (!signer) return
    setTxStatus(`Approving...`)
    try {
      const mc = getMarketContract(marketAddr, signer)
      const tx = await mc.approveMarket()
      await tx.wait()
      setTxStatus('Market approved!')
      loadData()
    } catch (e: any) {
      setTxStatus(`Error: ${e.message?.slice(0, 60)}`)
    }
  }

  const cancelMarket = async (marketAddr: string) => {
    if (!signer) return
    setTxStatus(`Cancelling...`)
    try {
      const mc = getMarketContract(marketAddr, signer)
      const tx = await mc.rejectMarket()
      await tx.wait()
      setTxStatus('Market cancelled!')
      loadData()
    } catch (e: any) {
      setTxStatus(`Error: ${e.message?.slice(0, 60)}`)
    }
  }

  const resolveMarketAction = async (marketAddr: string, winningOutcome: number) => {
    if (!signer) return
    setTxStatus(`Resolving market...`)
    try {
      const mc = getMarketContract(marketAddr, signer)
      const tx = await mc.resolveMarket(winningOutcome)
      await tx.wait()
      setTxStatus('Market resolved!')
      setResolvingAddr(null)
      setResolveOutcome(null)
      loadData()
    } catch (e: any) {
      setTxStatus(`Error: ${e.message?.slice(0, 60)}`)
    }
  }

  const fetchOutcomes = async (marketAddr: string) => {
    if (outcomesCache[marketAddr]) return outcomesCache[marketAddr]
    try {
      const outcomes = await fetchMarketOutcomes(marketAddr)
      setOutcomesCache(prev => ({ ...prev, [marketAddr]: outcomes }))
      return outcomes
    } catch {
      return []
    }
  }

  const togglePause = async () => {
    if (!signer) return
    setTxStatus(paused ? 'Resuming protocol...' : 'Pausing protocol...')
    try {
      const ac = getAccessManagerContract(signer)
      const tx = await ac.pause(!paused)
      await tx.wait()
      setPaused(!paused)
      setTxStatus(paused ? 'Protocol resumed' : 'Protocol paused')
    } catch (e: any) {
      setTxStatus(`Error: ${e.message?.slice(0, 60)}`)
    }
  }

  const updateFee = async () => {
    if (!signer || !feeInput) return
    setTxStatus('Updating fee...')
    try {
      const ac = getAccessManagerContract(signer)
      const tx = await ac.updateFee(parseEther(feeInput))
      await tx.wait()
      setProtocolFee(parseEther(feeInput))
      setTxStatus('Fee updated')
    } catch (e: any) {
      setTxStatus(`Error: ${e.message?.slice(0, 60)}`)
    }
  }

  const toggleUser = async (addr: string, suspend: boolean) => {
    if (!signer) return
    setTxStatus(`${suspend ? 'Suspending' : 'Unsuspending'} user...`)
    try {
      const ac = getAccessManagerContract(signer)
      const tx = await ac.suspendUser(addr, suspend)
      await tx.wait()
      setTxStatus(suspend ? 'User suspended' : 'User unsuspended')
    } catch (e: any) {
      setTxStatus(`Error: ${e.message?.slice(0, 60)}`)
    }
  }

  const pendingMarkets = markets.filter((m) => m.data.state === 0)
  const openMarkets = markets.filter((m) => m.data.state === 1)
  const lockedMarkets = markets.filter((m) => m.data.state === 2)
  const resolvedMarkets = markets.filter((m) => m.data.state === 3)
  const cancelledMarkets = markets.filter((m) => m.data.state === 4)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading admin data...
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield size={18} className="text-purple-400" />
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Admin Panel</h2>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto tabs-scroll -mx-1 px-1">
        {ADMIN_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              tab === t ? 'bg-purple-600 text-white' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {txStatus && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-zinc-800/50 text-xs text-zinc-300 flex items-center gap-2">
          {txStatus.includes('Error') ? <AlertTriangle size={14} className="text-red-400" /> : <Check size={14} className="text-emerald-400" />}
          {txStatus}
        </div>
      )}

      {tab === 'Overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="glass-card p-4 sm:p-5">
            <BarChart3 size={16} className="text-purple-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{marketCount}</div>
            <div className="text-xs text-zinc-500 mt-1">Total</div>
          </div>
          <div className="glass-card p-4 sm:p-5">
            <Flag size={16} className="text-yellow-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{pendingMarkets.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Pending</div>
          </div>
          <div className="glass-card p-4 sm:p-5">
            <Activity size={16} className="text-emerald-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{openMarkets.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Open</div>
          </div>
          <div className="glass-card p-4 sm:p-5">
            <Gavel size={16} className="text-orange-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{lockedMarkets.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Locked</div>
          </div>
          <div className="glass-card p-4 sm:p-5">
            <Check size={16} className="text-blue-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{resolvedMarkets.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Resolved</div>
          </div>
        </div>
      )}

      {tab === 'Overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="glass-card p-4 sm:p-5">
            <Coins size={16} className="text-purple-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{formatEther(treasuryStats[0] || 0n).slice(0, 8)} 0G</div>
            <div className="text-xs text-zinc-500 mt-1">Collected Fees</div>
          </div>
          <div className="glass-card p-4 sm:p-5">
            <TrendingUp size={16} className="text-purple-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{formatEther(treasuryStats[2] || 0n).slice(0, 8)} 0G</div>
            <div className="text-xs text-zinc-500 mt-1">Treasury Balance</div>
          </div>
          <div className="glass-card p-4 sm:p-5">
            <Activity size={16} className="text-purple-400 mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{paused ? 'Paused' : 'Active'}</div>
            <div className="text-xs text-zinc-500 mt-1">Protocol Status</div>
          </div>
        </div>
      )}

      {tab === 'Markets' && (
        <div className="space-y-6">
          {/* Pending */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border text-xs text-zinc-500 font-medium">
              Pending ({pendingMarkets.length})
            </div>
            {pendingMarkets.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-600 text-sm">No pending markets</div>
            ) : (
              pendingMarkets.map((m) => (
                <div key={m.address} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.data.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.data.category} · Creator: {m.data.creator.slice(0, 6)}...{m.data.creator.slice(-4)}</p>
                  </div>
                  <button onClick={() => approveMarket(m.address)} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors whitespace-nowrap self-start sm:self-auto">Approve</button>
                </div>
              ))
            )}
          </div>

          {/* Open */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border text-xs text-zinc-500 font-medium">
              Open ({openMarkets.length})
            </div>
            {openMarkets.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-600 text-sm">No open markets</div>
            ) : (
              openMarkets.map((m) => (
                <div key={m.address} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.data.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.data.category} · {Number(m.data.participantCount)} bettors · Ends {new Date(Number(m.data.endDate) * 1000).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => cancelMarket(m.address)} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors whitespace-nowrap self-start sm:self-auto">Cancel</button>
                </div>
              ))
            )}
          </div>

          {/* Locked — Resolve */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border text-xs text-zinc-500 font-medium">
              Locked — Ready for Resolution ({lockedMarkets.length})
            </div>
            {lockedMarkets.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-600 text-sm">No locked markets</div>
            ) : (
              lockedMarkets.map((m) => {
                const isResolving = resolvingAddr === m.address
                const outcomes = outcomesCache[m.address] || []
                return (
                  <div key={m.address} className="px-4 sm:px-5 py-4 border-b border-border last:border-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.data.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{m.data.category} · {Number(m.data.participantCount)} bettors · {Number(formatEther(m.data.totalVolume))} 0G volume</p>
                      </div>
                      {!isResolving && (
                        <button
                          onClick={async () => {
                            const o = await fetchOutcomes(m.address)
                            setResolvingAddr(m.address)
                            setResolveOutcome(null)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/30 transition-colors whitespace-nowrap self-start sm:self-auto"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                    {isResolving && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {outcomes.length === 0 && (
                            <span className="flex items-center gap-1 text-xs text-zinc-500"><Loader2 size={12} className="animate-spin" /> Loading outcomes...</span>
                          )}
                          {outcomes.map((o, i) => (
                            <button
                              key={i}
                              onClick={() => setResolveOutcome(i)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                resolveOutcome === i
                                  ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                              }`}
                            >
                              {o.name}
                            </button>
                          ))}
                        </div>
                        {outcomes.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => resolveMarketAction(m.address, resolveOutcome!)}
                              disabled={resolveOutcome === null}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Confirm Resolve
                            </button>
                            <button
                              onClick={() => { setResolvingAddr(null); setResolveOutcome(null) }}
                              className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-400 text-xs hover:text-zinc-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Resolved */}
          {resolvedMarkets.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border text-xs text-zinc-500 font-medium">
                Resolved ({resolvedMarkets.length})
              </div>
              {resolvedMarkets.map((m) => (
                <div key={m.address} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.data.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.data.category} · Winning outcome #{Number(m.data.winningOutcome) + 1} · {Number(formatEther(m.data.totalVolume))} 0G</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 whitespace-nowrap">Resolved</span>
                </div>
              ))}
            </div>
          )}

          {/* Cancelled */}
          {cancelledMarkets.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border text-xs text-zinc-500 font-medium">
                Cancelled ({cancelledMarkets.length})
              </div>
              {cancelledMarkets.map((m) => (
                <div key={m.address} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.data.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.data.category} · {Number(formatEther(m.data.totalVolume))} 0G</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 whitespace-nowrap">Cancelled</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Users' && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium mb-4">Check Moderator Status</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter wallet address..."
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="input-field flex-1 text-sm"
            />
            <button onClick={checkMod} className="btn-primary text-sm whitespace-nowrap" disabled={!userAddress}>
              Check
            </button>
          </div>
          {isMod !== null && (
            <div className={`px-4 py-2 rounded-lg text-xs ${isMod ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {isMod ? 'This address is a moderator' : 'This address is NOT a moderator'}
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs font-medium text-zinc-500 mb-2">Toggle User Status</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Wallet address to suspend/unsuspend..."
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                className="input-field flex-1 text-sm"
              />
              <button onClick={() => toggleUser(userAddress, true)} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors">
                Suspend
              </button>
              <button onClick={() => toggleUser(userAddress, false)} className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors">
                Unsuspend
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'Treasury' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium mb-4">Treasury Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Collected Fees</span><span className="font-medium">{formatEther(treasuryStats[0] || 0n)} 0G</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Distributed</span><span className="font-medium">{formatEther(treasuryStats[1] || 0n)} 0G</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Balance</span><span className="font-medium">{formatEther(treasuryStats[2] || 0n)} 0G</span></div>
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium mb-4">Fee Settings</h3>
            <label className="text-xs text-zinc-500 mb-1 block">Protocol Fee</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                className="input-field flex-1 text-sm"
                placeholder="Fee in 0G"
              />
              <button onClick={updateFee} className="btn-primary text-sm">Update</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'Settings' && (
        <div className="glass-card p-6 max-w-md">
          <h3 className="text-sm font-medium mb-4">Protocol Settings</h3>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-sm">Protocol Status</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${paused ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {paused ? 'Paused' : 'Active'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm">Emergency</span>
            <button
              onClick={togglePause}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                paused
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }`}
            >
              {paused ? 'Resume Protocol' : 'Pause Protocol'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────

export default function Home() {
  const { isConnected, address, chainId } = useWallet()
  const { activeTab } = useTab()

  // Chain warning
  const onWrongChain = isConnected && chainId !== 0 && chainId !== CHAIN.chainId

  const handleSwitchChain = async () => {
    const eth = (window as any).ethereum
    if (!eth) return
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4115' }],
      })
    } catch (e: any) {
      if (e.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x4115',
            chainName: '0G Mainnet (Aristotle)',
            nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
            rpcUrls: ['https://evmrpc.0g.ai'],
            blockExplorerUrls: ['https://chainscan.0g.ai'],
          }],
        })
      }
    }
  }

  if (!isConnected) {
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Chain Warning */}
      {onWrongChain && (
        <div className="border-b border-yellow-800 bg-yellow-500/5">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-yellow-300">
              <AlertTriangle size={16} />
              <span>Wrong network detected — please switch to <strong>0G Mainnet</strong></span>
            </div>
            <button
              onClick={handleSwitchChain}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-yellow-600 text-white hover:bg-yellow-500 transition-colors"
            >
              Switch to 0G
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'Markets' && <MarketsTab />}
        {activeTab === 'Leaderboard' && <LeaderboardTab />}
        {activeTab === 'Portfolio' && <PortfolioTab />}
        {activeTab === 'Admin' && <AdminPanel />}
      </div>

      <div className="border-t border-zinc-800 mt-8 sm:mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
          <span>OracleX — Prediction Markets on 0G</span>
          <div className="flex items-center gap-4">
            <a href={CHAIN.explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors flex items-center gap-1">
              <ExternalLink size={12} /> Explorer
            </a>
            <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
