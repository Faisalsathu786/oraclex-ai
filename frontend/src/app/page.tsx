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
  isOwner,
  isSuperAdmin,
  OWNER_WALLET,
  CATEGORIES,
  MARKET_STATE_LABELS,
  MARKET_STATE_COLORS,
  MarketData,
  OutcomeData,
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

// ─── LANDING PAGE ──────────────────────────────────────────────────

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center hero-glow px-6">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-6 shadow-glow">
          <span className="text-2xl font-bold text-white">X</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 gradient-text">OracleX AI</h1>
        <p className="text-zinc-400 text-lg mb-2 leading-relaxed">
          Decentralized prediction markets powered by AI on 0G
        </p>
        <p className="text-zinc-600 text-sm mb-10">
          Predict real-world outcomes, earn rewards, and climb the leaderboard
        </p>
        <WalletButton onConnect={() => {}} />
        <div className="mt-12 flex justify-center gap-8 text-xs text-zinc-600">
          <span>Powered by 0G</span>
          <span className="text-zinc-700">·</span>
          <a href="https://chainscan.0g.ai" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">
            Explorer
          </a>
          <span className="text-zinc-700">·</span>
          <span>On-Chain Markets</span>
        </div>
      </div>
    </div>
  )
}

// ─── MARKET LIST ────────────────────────────────────────────────────

function StateBadge({ state }: { state: number }) {
  const s = state as 0 | 1 | 2 | 3
  const label = MARKET_STATE_LABELS[s] || 'Unknown'
  const color = MARKET_STATE_COLORS[s] || 'text-zinc-400 bg-zinc-500/10'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Markets</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
          <div className="flex gap-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
            <Link key={m.address} href={`/markets/${i}`}>
              <div className="glass-card p-5 rounded-2xl hover:border-zinc-600 hover:bg-zinc-900/30 transition-all cursor-pointer h-full flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <StateBadge state={m.data.state} />
                    <span className="text-xs text-zinc-500">{m.data.category}</span>
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
  const { provider, address } = useWallet()
  const [balance, setBalance] = useState('0')
  const [bets, setBets] = useState<{ market: string; address: string; data: MarketData; outcomeIndex: number; outcomeName: string; amount: bigint; pool: bigint; totalPool: bigint }[]>([])
  const [loading, setLoading] = useState(true)

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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-2xl border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Wallet Balance</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{balance}</div>
          <div className="text-xs text-zinc-600 mt-1">0G Tokens</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Invested</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{totalInvested.toFixed(4)}</div>
          <div className="text-xs text-zinc-600 mt-1">0G Tokens</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Open Positions</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{openBets.length}</div>
          <div className="text-xs text-zinc-600 mt-1">Active bets</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border-zinc-800">
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
                    <div key={b.address} className="glass-card p-5 rounded-2xl hover:border-zinc-700 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{b.market}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-medium">
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
                  return (
                    <div key={b.address} className={`glass-card p-4 rounded-2xl flex items-center justify-between border ${won ? 'border-emerald-500/30' : 'border-red-500/20'}`}>
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

const ADMIN_TABS = ['Overview', 'Pending Markets', 'Users', 'Treasury', 'Settings']

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
    setTxStatus(`Approving market ${marketAddr.slice(0, 6)}...${marketAddr.slice(-4)} ...`)
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

      <div className="flex gap-1 mb-6 overflow-x-auto tabs-scroll">
        {ADMIN_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <BarChart3 size={18} className="text-purple-400 mb-2" />
            <div className="text-2xl font-bold">{marketCount}</div>
            <div className="text-xs text-zinc-500 mt-1">Total Markets</div>
          </div>
          <div className="glass-card p-5">
            <Coins size={18} className="text-purple-400 mb-2" />
            <div className="text-2xl font-bold">{formatEther(treasuryStats[0] || 0n).slice(0, 8)} 0G</div>
            <div className="text-xs text-zinc-500 mt-1">Collected Fees</div>
          </div>
          <div className="glass-card p-5">
            <TrendingUp size={18} className="text-purple-400 mb-2" />
            <div className="text-2xl font-bold">{formatEther(treasuryStats[2] || 0n).slice(0, 8)} 0G</div>
            <div className="text-xs text-zinc-500 mt-1">Treasury Balance</div>
          </div>
          <div className="glass-card p-5">
            <Flag size={18} className="text-purple-400 mb-2" />
            <div className="text-2xl font-bold">{pendingMarkets.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Pending Approval</div>
          </div>
        </div>
      )}

      {tab === 'Pending Markets' && (
        <div>
          {pendingMarkets.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 text-sm">No pending markets</div>
          ) : (
            <div className="glass-card overflow-hidden">
              {pendingMarkets.map((m) => (
                <div key={m.address} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium truncate">{m.data.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.data.category} · Creator: {m.data.creator.slice(0, 6)}...{m.data.creator.slice(-4)}</p>
                  </div>
                  <button
                    onClick={() => approveMarket(m.address)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors whitespace-nowrap"
                  >
                    Approve
                  </button>
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

// ─── APP HEADER ─────────────────────────────────────────────────────

const TABS = ['Markets', 'Leaderboard', 'Portfolio', 'Admin']

function AppHeader({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const { isOwnerWallet } = useWallet()
  const showTabs = isOwnerWallet ? TABS : TABS.slice(0, 3)

  return (
    <div className="border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              X
            </div>
            <span className="text-lg font-bold tracking-tight">OracleX</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {showTabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2.5 rounded-xl text-base font-semibold tracking-wide transition-all duration-200 ${
                  activeTab === t 
                    ? t === 'Markets' ? 'text-emerald-300 bg-emerald-500/15 shadow-sm shadow-emerald-500/20' 
                      : t === 'Leaderboard' ? 'text-amber-300 bg-amber-500/15 shadow-sm shadow-amber-500/20'
                      : t === 'Portfolio' ? 'text-blue-300 bg-blue-500/15 shadow-sm shadow-blue-500/20'
                      : 'text-purple-300 bg-purple-500/15 shadow-sm shadow-purple-500/20'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOwnerWallet && (
            <Link href="/create" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-500 transition-colors">
              <Plus size={14} /> Create Market
            </Link>
          )}
          <WalletButton />
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────

export default function Home() {
  const { isConnected, address, chainId } = useWallet()
  const [activeTab, setActiveTab] = useState('Markets')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const { isOwnerWallet } = useWallet()
  const showTabs = isOwnerWallet ? TABS : TABS.slice(0, 3)

  // Chain warning
  const onWrongChain = isConnected && chainId !== 0 && chainId !== CHAIN.chainId

  useEffect(() => {
    setMobileNavOpen(false)
  }, [activeTab])

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
      <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} />

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

      {/* Mobile Tabs */}
      <div className="md:hidden border-b border-zinc-800 px-4 py-2">
        <div className="flex gap-1 overflow-x-auto tabs-scroll">
          {showTabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === t ? 'bg-zinc-800 text-white' : 'text-zinc-500'
              }`}
            >
              {t}
            </button>
          ))}
          {isOwnerWallet && (
            <Link href="/create" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white whitespace-nowrap">
              + New Market
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'Markets' && <MarketsTab />}
        {activeTab === 'Leaderboard' && <LeaderboardTab />}
        {activeTab === 'Portfolio' && <PortfolioTab />}
        {activeTab === 'Admin' && <AdminPanel />}
      </div>

      <div className="border-t border-zinc-800 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-zinc-600">
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
