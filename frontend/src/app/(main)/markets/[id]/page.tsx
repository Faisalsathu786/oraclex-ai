'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@/components/web3/Web3Provider'
import { CHAIN } from '@/lib/config'
import { formatEther } from 'ethers'
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
  BetData,
} from '@/lib/contracts'

const OUTCOME_COLORS = [
  { border: 'border-blue-500', bg: 'bg-blue-950/20', dot: 'bg-blue-500', bar: 'bar-blue', text: 'text-blue-400', ring: 'ring-blue-500/20', btn: 'bg-blue-600 hover:bg-blue-500' },
  { border: 'border-violet-500', bg: 'bg-violet-950/20', dot: 'bg-violet-500', bar: 'bar-violet', text: 'text-violet-400', ring: 'ring-violet-500/20', btn: 'bg-violet-600 hover:bg-violet-500' },
  { border: 'border-amber-500', bg: 'bg-amber-950/20', dot: 'bg-amber-500', bar: 'bar-amber', text: 'text-amber-400', ring: 'ring-amber-500/20', btn: 'bg-amber-600 hover:bg-amber-500' },
  { border: 'border-cyan-500', bg: 'bg-cyan-950/20', dot: 'bg-cyan-500', bar: 'bar-cyan', text: 'text-cyan-400', ring: 'ring-cyan-500/20', btn: 'bg-cyan-600 hover:bg-cyan-500' },
  { border: 'border-emerald-500', bg: 'bg-emerald-950/20', dot: 'bg-emerald-500', bar: 'bar-emerald', text: 'text-emerald-400', ring: 'ring-emerald-500/20', btn: 'bg-emerald-600 hover:bg-emerald-500' },
  { border: 'border-rose-500', bg: 'bg-rose-950/20', dot: 'bg-rose-500', bar: 'bar-rose', text: 'text-rose-400', ring: 'ring-rose-500/20', btn: 'bg-rose-600 hover:bg-rose-500' },
]

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
  const [showDesc, setShowDesc] = useState(false)

  const loadMarket = useCallback(async () => {
    if (isNaN(marketIndex)) return
    setLoading(true)
    setError('')
    try {
      const rpc = getRpcProvider()
      const factory = getFactoryContract(rpc)
      const addr: string = await factory.getMarket(marketIndex)
      if (!addr || addr === '0x0000000000000000000000000000000000000000') {
        setError('Market not found'); setLoading(false); return
      }
      setMarketAddress(addr)
      const mc = getMarketContract(addr, rpc)
      const raw = await mc.market()
      setData({
        address: addr, id: raw.id, title: raw.title || '', description: raw.description || '',
        category: raw.category || '', imageUrl: raw.imageUrl || '', creator: raw.creator || '',
        state: Number(raw.state) as 0|1|2|3, endDate: raw.endDate, createdAt: raw.createdAt,
        totalVolume: raw.totalVolume, participantCount: raw.participantCount,
        winningOutcome: raw.winningOutcome, resolved: raw.resolved,
      })
      setOutcomes(await fetchMarketOutcomes(addr))
    } catch (e: any) { setError(e.message || 'Failed to load market') }
    setLoading(false)
  }, [marketIndex])

  useEffect(() => { loadMarket() }, [loadMarket])

  useEffect(() => {
    if (!marketAddress || !address) return
    const load = async () => {
      try {
        const rpc = getRpcProvider()
        const mc = getMarketContract(marketAddress, rpc)
        const hb = await mc.hasBet(address)
        if (hb) {
          const raw = await mc.bets(address)
          setUserBet({ user: raw.user, outcomeIndex: raw.outcomeIndex, amount: raw.amount, claimedAt: raw.claimedAt })
        } else setUserBet(null)
      } catch { setUserBet(null) }
    }
    load()
  }, [marketAddress, address])

  const handleClaim = async () => {
    if (!signer || !marketAddress) return
    setClaiming(true); setTxStatus('Claiming reward...'); setTxHash('')
    try {
      const hash = await claimReward(marketAddress, signer)
      setTxHash(hash); setTxStatus('Reward claimed')
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
    setPlacing(true); setTxStatus('Submitting bet...'); setTxHash('')
    try {
      const hash = await placeBet(marketAddress, selectedOutcome, betAmount, signer)
      setTxHash(hash); setTxStatus('Bet placed'); loadMarket()
    } catch (e: any) { setTxStatus(e.message?.slice(0, 100) || 'Transaction failed') }
    setPlacing(false)
  }

  const isOpen = data?.state === 1
  const isResolved = data?.state === 3
  const endDateStr = data?.endDate ? new Date(Number(data.endDate) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const timeRemaining = data?.endDate ? getTimeRemaining(data.endDate) : '—'
  const totalPool = outcomes.reduce((s, o) => s + o.pool, 0n)

  const getPayoutMultiplier = (outcomePool: bigint) => {
    if (totalPool === 0n || outcomePool === 0n) return '1.00x'
    return (Number(totalPool) / Number(outcomePool)).toFixed(2) + 'x'
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-zinc-800 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
          <h2 className="text-lg font-bold mb-2">Connect to View Market</h2>
          <p className="text-zinc-500 text-sm mb-6">Connect your wallet to view outcomes and place bets</p>
          <button onClick={connect} className="btn btn-primary w-full">Connect Wallet</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-8 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-4 text-red-400"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        <p className="text-zinc-400 mb-2">{error}</p>
        <Link href="/markets" className="btn btn-outline mt-4">Back to Markets</Link>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <Link href="/markets" className="hover:text-zinc-400 transition-colors">Markets</Link>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-[300px]">{data.title}</span>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className={`tag ${getCategoryClass(data.category)}`}>{data.category}</span>
          <span className={`tag ${getStateClass(data.state)}`}>{MARKET_STATE_LABELS[data.state as 0|1|2|3|4] || 'Unknown'}</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight">{data.title}</h1>
        {data.imageUrl && <img src={data.imageUrl} alt="" className="w-full h-48 object-cover rounded-xl border border-zinc-800" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
        <div className="flex items-center gap-4 text-xs text-zinc-500 pt-3 border-t border-zinc-800">
          <span>Resolution: {endDateStr}</span>
          <span>Time left: {timeRemaining}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat"><p className="stat-value">{Number(formatEther(data.totalVolume)).toFixed(1)}</p><p className="stat-label">Volume (0G)</p></div>
        <div className="stat"><p className="stat-value">{Number(data.participantCount)}</p><p className="stat-label">Bettors</p></div>
        <div className="stat"><p className="stat-value">{(Number(formatEther(totalPool))).toFixed(1)}</p><p className="stat-label">Total Pool</p></div>
        <div className="stat"><p className="stat-value">{timeRemaining}</p><p className="stat-label">Time Left</p></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Outcome & Place Bet</h2>

          {outcomes.length === 0 ? (
            <div className="card p-10 text-center text-zinc-600 text-sm">No outcomes loaded</div>
          ) : (
            <div className={`grid gap-4 ${outcomes.length <= 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
              {outcomes.map((o, i) => {
                const poolPct = totalPool > 0n ? Math.round(Number(o.pool * 10000n) / Number(totalPool)) / 100 : 0
                const isSelected = selectedOutcome === i
                const isWinner = isResolved && Number(data.winningOutcome) === i
                const myBet = userBet && Number(userBet.outcomeIndex) === i
                const c = OUTCOME_COLORS[i % OUTCOME_COLORS.length]

                return (
                  <div key={i} className="flex flex-col">
                    <button
                      onClick={() => {
                        if (isOpen && !placing) {
                          if (isSelected) { setSelectedOutcome(null); setBetAmount('') }
                          else { setSelectedOutcome(i); setBetAmount('') }
                        }
                      }}
                      disabled={!isOpen && !isWinner && !myBet}
                      className={`w-full text-left rounded-xl border-2 transition-all duration-200 ${
                        isSelected ? `${c.border} ${c.bg} ring-2 ${c.ring} rounded-b-none border-b-0`
                        : isWinner ? 'border-emerald-500/60 bg-emerald-950/20'
                        : myBet ? 'border-zinc-600 bg-zinc-900/50'
                        : 'border-zinc-800 bg-transparent hover:border-zinc-600 hover:bg-zinc-900/30'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? c.border : isWinner ? 'border-emerald-500' : myBet ? 'border-zinc-500' : 'border-zinc-700'
                            }`}>
                              {(isSelected || isWinner || myBet) && (
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                  isSelected ? c.dot : isWinner ? 'bg-emerald-500' : 'bg-zinc-500'
                                }`} />
                              )}
                            </div>
                            <h3 className="text-base font-semibold truncate">{o.name || `Outcome ${i + 1}`}</h3>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            {isWinner && <span className="tag tag-green">Won</span>}
                            {myBet && !isWinner && <span className="tag tag-blue">Your Pick</span>}
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="bar h-2.5">
                            <div className={`bar-fill ${isSelected ? c.bar : isWinner ? 'bar-green' : 'bar-zinc'}`} style={{ width: `${Math.max(2, poolPct)}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <span className="text-xl font-bold tabular-nums text-white">{poolPct.toFixed(1)}%</span>
                            <span className="text-sm text-zinc-500">{Number(formatEther(o.pool)).toFixed(2)} 0G</span>
                          </div>
                          <span className="text-sm text-zinc-500 font-mono">{getPayoutMultiplier(o.pool)}</span>
                        </div>
                      </div>
                    </button>

                    {isSelected && isOpen && (
                      <div className={`rounded-b-xl border-2 border-t-0 ${c.border} ${c.bg} p-5`}>
                        <p className="text-sm font-medium text-zinc-300 mb-4">
                          Place bet on <span className={c.text}>{o.name}</span>
                        </p>

                        <div className="flex items-center gap-2 mb-4">
                          {['1', '5', '10', '50'].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setBetAmount(amt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                betAmount === amt ? `${c.border} ${c.bg} ${c.text}` : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                              }`}
                            >
                              {amt} 0G
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2 mb-4">
                          <div className="relative flex-1">
                            <input
                              type="number" step="0.001" min="0" placeholder="Custom amount"
                              value={betAmount} onChange={e => setBetAmount(e.target.value)}
                              className="input pr-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">0G</span>
                          </div>
                          <button
                            onClick={handlePlaceBet}
                            disabled={!betAmount || Number(betAmount) <= 0 || placing}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 ${c.btn}`}
                          >
                            {placing ? 'Placing...' : 'Place Bet'}
                          </button>
                        </div>

                        {betAmount && Number(betAmount) > 0 && (
                          <div className="flex items-center gap-4 text-xs text-zinc-500 bg-black/30 rounded-lg px-3 py-2">
                            <span>Estimated payout:</span>
                            <span className="text-green-400 font-semibold tabular-nums">
                              {(Number(betAmount) * Number(totalPool) / Math.max(1, Number(o.pool || 1n))).toFixed(3)} 0G
                            </span>
                            <span className="text-zinc-600">x{getPayoutMultiplier(o.pool).replace('x', '')}</span>
                          </div>
                        )}

                        {txStatus && (
                          <div className={`mt-3 px-3 py-2 rounded-lg text-xs ${
                            txStatus.includes('Error') || txStatus.includes('failed')
                              ? 'bg-red-500/10 text-red-400'
                              : txStatus.includes('placed') || txStatus.includes('Reward') || txStatus.includes('claimed')
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {txStatus}
                            {txHash && <a href={`${CHAIN.explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="ml-2 underline">View tx</a>}
                          </div>
                        )}
                      </div>
                    )}

                    {isWinner && userBet && userBet.claimedAt === 0n && (
                      <button onClick={handleClaim} disabled={claiming} className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium p-3 transition-colors">
                        {claiming ? 'Claiming Reward...' : 'Claim Reward'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {userBet && !isOpen && !isResolved && data.state !== 4 && (
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-2">Your bet on this market</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">{outcomes[Number(userBet.outcomeIndex)]?.name || 'Unknown'}</span>
                <span className="text-sm font-bold tabular-nums">{formatEther(userBet.amount)} 0G</span>
              </div>
            </div>
          )}

          <div className="card p-5">
            <button onClick={() => setShowDesc(!showDesc)} className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Market Details</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${showDesc ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDesc && (
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                {data.description && <p className="text-sm text-zinc-400 leading-relaxed">{data.description}</p>}
                <div className="flex items-center gap-3 text-xs text-zinc-600">
                  <span>Creator: {data.creator.slice(0, 6)}...{data.creator.slice(-4)}</span>
                  <a href={`${CHAIN.explorerUrl}/address/${data.address}`} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400">Contract</a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Analysis</h2>
          {/* AI Analysis */}
          {(() => {
            const sorted = [...outcomes].map((o, i) => ({ ...o, index: i })).sort((a, b) => Number(b.pool - a.pool))
            const leader = sorted[0]
            const leaderPct = totalPool > 0n ? Number(leader.pool * 100n / totalPool) : 50
            const confidence = Math.min(95, Math.round(leaderPct + 10))
            const riskLevel = leaderPct > 80 ? 'Low' : leaderPct > 60 ? 'Medium' : 'High'

            return (
              <div className="card p-5 space-y-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Market Sentiment</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-zinc-500">Leading</span><span className="text-zinc-300 font-medium">{leader?.name || 'N/A'}</span></div>
                    <div className="bar"><div className="bar-fill bar-blue" style={{ width: `${leaderPct}%` }} /></div>
                    <p className="text-xs text-zinc-500 mt-1">{leaderPct.toFixed(0)}% probability</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-zinc-500">Confidence</span><span className="text-green-400 font-medium">{confidence}%</span></div>
                    <div className="bar"><div className="bar-fill bar-green" style={{ width: `${confidence}%` }} /></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Risk</span>
                    <span className={`font-medium ${riskLevel === 'Low' ? 'text-green-400' : riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{riskLevel}</span>
                  </div>
                </div>
              </div>
            )
          })()}

          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Market Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-zinc-500">Status</span><span>{MARKET_STATE_LABELS[data.state as 0|1|2|3|4]}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Outcomes</span><span>{outcomes.length}</span></div>
              {userBet && <div className="flex justify-between"><span className="text-zinc-500">Your bet</span><span className="tabular-nums">{formatEther(userBet.amount)} 0G</span></div>}
              {userBet && userBet.claimedAt > 0n && <div className="text-green-400 text-xs">Claimed</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
