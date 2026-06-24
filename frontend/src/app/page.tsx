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
      const m = await fetchAllMarkets(provider)
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
        <div className="glass-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 border-b border-border text-xs text-zinc-500 font-medium">
            <span className="col-span-5">Market</span>
            <span className="col-span-2">Category</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1 text-right">Volume</span>
            <span className="col-span-2 text-right">Participants</span>
          </div>
          {filtered.map((m, i) => (
            <Link key={m.address} href={`/markets/${i}`}>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 px-5 py-4 border-b border-border last:border-0 hover:bg-zinc-800/30 transition-colors cursor-pointer">
                <div className="sm:col-span-5">
                  <span className="text-sm font-medium line-clamp-1">{m.data.title}</span>
                  <div className="flex sm:hidden items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">{m.data.category}</span>
                    <StateBadge state={m.data.state} />
                  </div>
                </div>
                <span className="hidden sm:block sm:col-span-2 text-sm text-zinc-400">{m.data.category}</span>
                <div className="hidden sm:block sm:col-span-2">
                  <StateBadge state={m.data.state} />
                </div>
                <span className="hidden sm:block sm:col-span-1 text-sm text-right text-zinc-400">
                  {Number(m.data.totalVolume) > 0 ? `${formatEther(m.data.totalVolume)} 0G` : '—'}
                </span>
                <span className="hidden sm:block sm:col-span-2 text-sm text-right text-zinc-400">
                  {Number(m.data.participantCount)}
                </span>
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
  const [markets, setMarkets] = useState<{ address: string; data: MarketData }[]>([])
  const [bets, setBets] = useState<{ market: MarketData; outcomeIndex: number; amount: bigint; pool: bigint }[]>([])
  const [loading, setLoading] = useState(true)
  const [outcomesCache, setOutcomesCache] = useState<Record<string, OutcomeData[]>>({})

  useEffect(() => {
    const load = async () => {
      if (!provider || !address) return
      setLoading(true)
      try {
        const all = await fetchAllMarkets(provider)
        const userBets: typeof bets = []
        const oc: typeof outcomesCache = {}

        for (const m of all) {
          const bet = await fetchUserBet(m.address, address, provider)
          if (bet && bet.amount > 0n) {
            if (!oc[m.address]) {
              oc[m.address] = await fetchMarketOutcomes(m.address, provider)
            }
            const outcomes = oc[m.address]
            const outcomePool = outcomes[Number(bet.outcomeIndex)]?.pool || 0n
            userBets.push({
              market: m.data,
              outcomeIndex: Number(bet.outcomeIndex),
              amount: bet.amount,
              pool: outcomePool,
            })
          }
        }

        setOutcomesCache(oc)
        setBets(userBets)
        setMarkets(all)
      } catch (e) {
        console.error('Portfolio load error', e)
      }
      setLoading(false)
    }
    load()
  }, [provider, address])

  const totalInvested = bets.reduce((s, b) => s + Number(formatEther(b.amount)), 0)

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

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="text-lg font-semibold tabular-nums">{totalInvested.toFixed(4)} 0G</div>
          <div className="text-xs text-zinc-500 mt-1">Total Invested</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-lg font-semibold tabular-nums">{bets.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Active Positions</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-lg font-semibold tabular-nums">
            {bets.length > 0 ? Math.round(markets.length > 0 ? (bets.length / markets.length) * 100 : 0) : 0}%
          </div>
          <div className="text-xs text-zinc-500 mt-1">Market Participation</div>
        </div>
      </div>

      {bets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
          <Wallet size={40} className="mb-3 opacity-30" />
          <p className="text-sm text-zinc-500">No active bets</p>
          <p className="text-xs text-zinc-600 mt-1">Place your first prediction to see it here</p>
          <Link href="/markets" className="btn-primary mt-4 text-xs">Browse Markets</Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-5 gap-3 px-5 py-3 border-b border-border text-xs text-zinc-500 font-medium">
            <span className="col-span-2">Market</span>
            <span>Outcome</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>
          {bets.map((b) => (
            <div key={b.market.address + b.outcomeIndex} className="grid grid-cols-5 gap-3 px-5 py-3.5 items-center border-b border-border last:border-0 hover:bg-zinc-800/30 text-sm">
              <span className="col-span-2 text-xs line-clamp-1">{b.market.title}</span>
              <span className="text-xs text-zinc-400">Outcome #{b.outcomeIndex + 1}</span>
              <span className="text-right text-xs font-mono">{formatEther(b.amount)} 0G</span>
              <div className="text-right">
                <StateBadge state={b.market.state} />
              </div>
            </div>
          ))}
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
      const count = await factory.marketCount()
      setMarketCount(Number(count))

      const all = await fetchAllMarkets(provider)
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
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
              X
            </div>
            <span className="text-base font-bold tracking-tight">OracleX</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {showTabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === t ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
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
  const { isConnected, address } = useWallet()
  const [activeTab, setActiveTab] = useState('Markets')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const { isOwnerWallet } = useWallet()
  const showTabs = isOwnerWallet ? TABS : TABS.slice(0, 3)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [activeTab])

  if (!isConnected) {
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} />

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
