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
  MARKET_STATE_COLORS,
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
} from 'lucide-react'

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

  // Fetch user bet info
  useEffect(() => {
    if (!marketAddress || !address) return
    const loadBet = async () => {
      try {
        const rpc = getRpcProvider()
        const mc = getMarketContract(marketAddress, rpc)
        const hb = await mc.hasBet(address)
        if (hb) {
          const raw = await mc.bets(address)
          setUserBet({
            user: raw.user,
            outcomeIndex: raw.outcomeIndex,
            amount: raw.amount,
            claimedAt: raw.claimedAt,
          })
        } else {
          setUserBet(null)
        }
      } catch {
        setUserBet(null)
      }
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
      // Refresh bet data
      const rpc = getRpcProvider()
      const mc = getMarketContract(marketAddress, rpc)
      const raw = await mc.bets(address!)
      setUserBet({
        user: raw.user,
        outcomeIndex: raw.outcomeIndex,
        amount: raw.amount,
        claimedAt: raw.claimedAt,
      })
      loadMarket()
    } catch (e: any) {
      setTxStatus(e.message?.slice(0, 100) || 'Claim failed')
    }
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
    } catch (e: any) {
      setTxStatus(e.message?.slice(0, 100) || 'Transaction failed')
    }
    setPlacing(false)
  }

  const isOpen = data?.state === 1
  const isResolved = data?.state === 3
  const endDateStr = data?.endDate
    ? new Date(Number(data.endDate) * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''
  const totalPool = outcomes.reduce((s, o) => s + o.pool, 0n)
  const getYesPrice = () => {
    if (totalPool === 0n) return 0.5
    const shares = 2n // default 2 outcomes for simple YES/NO
    return outcomes.length >= 2 ? Number(outcomes[0].pool * 100n / (outcomes[0].pool + outcomes[1].pool)) / 100 : 0.5
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Wallet size={40} className="mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400 mb-4">Connect your wallet to view this market</p>
          <button onClick={connect} className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Back to markets
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading && (
          <div className="flex items-center justify-center py-20 text-zinc-500">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading market...
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <AlertTriangle size={32} className="mx-auto mb-4 text-red-400" />
            <p className="text-zinc-400 mb-4">{error}</p>
            <Link href="/" className="text-sm text-purple-400 hover:text-purple-300">← Back to markets</Link>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Market Info */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="glass-card p-4 sm:p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-flex items-center px-3 py-0.5 rounded text-xs font-medium bg-purple-500/15 text-purple-300">
                    {data.category}
                  </span>
                  <span className={`inline-flex items-center px-3 py-0.5 rounded text-xs font-medium ${MARKET_STATE_COLORS[data.state as 0|1|2|3] || 'text-zinc-400 bg-zinc-500/10'}`}>
                    {MARKET_STATE_LABELS[data.state as 0|1|2|3] || 'Unknown'}
                  </span>
                </div>
                <h1 className="text-xl font-bold mb-3">{data.title}</h1>
                {data.description && (
                  <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{data.description}</p>
                )}
                {/* Show image */}
                {data.imageUrl && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-zinc-800">
                    <img src={data.imageUrl} alt={data.title} className="w-full h-40 sm:h-48 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Clock size={13} /> Ends {endDateStr}</span>
                  <span className="flex items-center gap-1"><Users size={13} /> {Number(data.participantCount)} participants</span>
                  <span className="flex items-center gap-1"><TrendingUp size={13} /> {formatEther(data.totalVolume)} 0G volume</span>
                  <span className="flex items-center gap-1">
                    <ExternalLink size={13} />
                    <a href={`${CHAIN.explorerUrl}/address/${data.address}`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">
                      Contract
                    </a>
                  </span>
                </div>
              </div>

              {/* Outcomes */}
              <div className="glass-card p-4 sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Outcomes</h2>
                {outcomes.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-sm">No outcomes loaded</div>
                ) : (
                  <div className="grid gap-3">
                    {outcomes.map((o, i) => {
                      const poolPct = totalPool > 0n ? Number((o.pool * 10000n) / totalPool) / 100 : 0
                      return (
                        <div
                          key={i}
                          onClick={() => isOpen && !placing && setSelectedOutcome(i)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                            selectedOutcome === i
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/50'
                          } ${!isOpen || placing ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${selectedOutcome === i ? 'bg-purple-400' : 'bg-zinc-600'}`} />
                            <span className="text-sm font-medium">{o.name || `Outcome ${i + 1}`}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{formatEther(o.pool)} 0G</div>
                            {totalPool > 0n && <div className="text-xs text-zinc-500">{poolPct.toFixed(1)}%</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {isResolved && (
                <div className="glass-card p-6 border-emerald-500/30">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <Check size={20} />
                    <span className="text-sm font-medium">
                      Market resolved — Winning outcome: #{Number(data.winningOutcome) + 1}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Betting Panel */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-6">
                {/* User Bet Info */}
                {userBet && (
                  <div className="mb-4 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700">
                    <p className="text-xs text-zinc-500 mb-1">Your Bet</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{outcomes[Number(userBet.outcomeIndex)]?.name || `#${Number(userBet.outcomeIndex) + 1}`}</span>
                      <span className="text-sm font-bold tabular-nums">{formatEther(userBet.amount)} 0G</span>
                    </div>
                    {userBet.claimedAt > 0n && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                        <Check size={12} /> Claimed
                      </div>
                    )}
                  </div>
                )}

                {!isOpen && !isResolved && data.state !== 4 && !userBet && (
                  <div className="text-center py-8 text-zinc-500">
                    <Clock size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Betting is not open for this market</p>
                  </div>
                )}

                {/* Cancelled state */}
                {data.state === 4 && (
                  <div className="text-center py-8 text-zinc-500">
                    <AlertTriangle size={24} className="mx-auto mb-2 text-red-400" />
                    <p className="text-sm text-red-400">Market was cancelled</p>
                    {userBet && (
                      <p className="text-xs text-zinc-600 mt-2">
                        Your {formatEther(userBet.amount)} 0G bet on &quot;{outcomes[Number(userBet.outcomeIndex)]?.name}&quot; is impacted.
                        Contact admin for refund.
                      </p>
                    )}
                  </div>
                )}

                {/* Resolved — Claim */}
                {isResolved && (
                  <div>
                    <div className="text-center mb-4">
                      <Check size={24} className="mx-auto mb-2 text-emerald-400" />
                      <p className="text-sm text-zinc-400">Market resolved</p>
                      <p className="text-xs text-emerald-400 font-medium mt-1">
                        Winner: {outcomes[Number(data.winningOutcome)]?.name || `#${Number(data.winningOutcome) + 1}`}
                      </p>
                    </div>
                    {userBet && Number(userBet.outcomeIndex) === Number(data.winningOutcome) && userBet.claimedAt === 0n && (
                      <button
                        onClick={handleClaim}
                        disabled={claiming || !signer}
                        className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {claiming ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={14} className="animate-spin" /> Claiming...
                          </span>
                        ) : (
                          `Claim Reward`
                        )}
                      </button>
                    )}
                    {userBet && Number(userBet.outcomeIndex) !== Number(data.winningOutcome) && (
                      <div className="text-center py-3 text-xs text-zinc-500">
                        <AlertTriangle size={14} className="mx-auto mb-1 text-red-400" />
                        You bet on {outcomes[Number(userBet.outcomeIndex)]?.name}. Better luck next time!
                      </div>
                    )}
                    {userBet && Number(userBet.outcomeIndex) === Number(data.winningOutcome) && userBet.claimedAt > 0n && (
                      <div className="text-center py-3 flex items-center justify-center gap-2 text-sm text-emerald-400">
                        <Check size={16} /> Reward claimed
                      </div>
                    )}
                    {!userBet && (
                      <div className="text-center py-3 text-xs text-zinc-600">No bet placed on this market</div>
                    )}
                  </div>
                )}

                {isOpen && (
                  <>
                    <p className="text-xs text-zinc-500 mb-3">
                      Select an outcome above, then enter the amount of 0G to bet
                    </p>

                    <div className="mb-4">
                      <label className="text-xs text-zinc-500 mb-1 block">Amount (0G)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          placeholder="0.0"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="input-field pr-12 text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">0G</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceBet}
                      disabled={selectedOutcome === null || !betAmount || !signer || placing}
                      className="w-full py-3 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-3"
                    >
                      {placing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={14} className="animate-spin" /> Placing Bet...
                        </span>
                      ) : (
                        `Bet on ${selectedOutcome !== null && outcomes[selectedOutcome] ? outcomes[selectedOutcome].name : '...'}`
                      )}
                    </button>

                    {txStatus && (
                      <div className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
                        txStatus.includes('success') || txStatus.includes('Bet placed')
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : txStatus.includes('Error') || txStatus.includes('failed')
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {txStatus.includes('Error') ? <AlertTriangle size={12} /> : txStatus.includes('success') || txStatus.includes('Bet placed') ? <Check size={12} /> : <Loader2 size={12} className="animate-spin" />}
                        <span className="flex-1">{txStatus}</span>
                      </div>
                    )}

                    {txHash && (
                      <a
                        href={`${CHAIN.explorerUrl}/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                      >
                        <ExternalLink size={12} /> View transaction
                      </a>
                    )}

                    <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 text-xs text-zinc-500">
                      <div className="flex justify-between">
                        <span>Outcome selected</span>
                        <span className="text-white font-medium">
                          {selectedOutcome !== null ? (outcomes[selectedOutcome]?.name || `#${selectedOutcome + 1}`) : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pool share</span>
                        <span className="text-white font-medium">
                          {selectedOutcome !== null && totalPool > 0n
                            ? `${(Number(outcomes[selectedOutcome]?.pool || 0n) * 100 / Number(totalPool)).toFixed(1)}%`
                            : '—'}
                        </span>
                      </div>
                    </div>
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
