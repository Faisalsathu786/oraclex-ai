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
  OWNER_WALLET,
  BetData,
} from '@/lib/contracts'

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
        setError('Market not found')
        setLoading(false)
        return
      }
      setMarketAddress(addr)

      const mc = getMarketContract(addr, rpc)
      const raw = await mc.market()
      setData({
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
      })

      const fetched = await fetchMarketOutcomes(addr)
      setOutcomes(fetched)
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
        } else setUserBet(null)
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
      setTxStatus('Reward claimed')
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
      setTxStatus('Bet placed')
      loadMarket()
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-24" />)}
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <Link href="/markets" className="hover:text-zinc-400 transition-colors">Markets</Link>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-[300px]">{data.title}</span>
      </div>

      {/* Market header */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className={`tag ${getCategoryClass(data.category)}`}>{data.category}</span>
          <span className={`tag ${getStateClass(data.state)}`}>{MARKET_STATE_LABELS[data.state as 0|1|2|3|4] || 'Unknown'}</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight">{data.title}</h1>
        {data.imageUrl && (
          <img src={data.imageUrl} alt="" className="w-full h-48 object-cover rounded-xl border border-zinc-800" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
        <div className="flex items-center gap-4 text-xs text-zinc-500 pt-3 border-t border-zinc-800">
          <span>Resolution: {endDateStr}</span>
          <span>Time left: {timeRemaining}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat"><p className="stat-value">{Number(formatEther(data.totalVolume)).toFixed(1)}</p><p className="stat-label">Volume (0G)</p></div>
        <div className="stat"><p className="stat-value">{Number(data.participantCount)}</p><p className="stat-label">Bettors</p></div>
        <div className="stat"><p className="stat-value">{(Number(formatEther(totalPool))).toFixed(1)}</p><p className="stat-label">Total Pool</p></div>
        <div className="stat"><p className="stat-value">{timeRemaining}</p><p className="stat-label">Time Left</p></div>
      </div>

      {/* Main grid: Outcomes + Bet on left, Info on right */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Outcomes & Place Bet</h2>

          {outcomes.length === 0 ? (
            <div className="card p-10 text-center text-zinc-600 text-sm">No outcomes loaded</div>
          ) : (
            <div className="space-y-3">
              {outcomes.map((o, i) => {
                const poolPct = totalPool > 0n ? Math.round(Number(o.pool * 10000n) / Number(totalPool)) / 100 : 0
                const isSelected = selectedOutcome === i
                const isWinner = isResolved && Number(data.winningOutcome) === i
                const myBet = userBet && Number(userBet.outcomeIndex) === i

                return (
                  <div
                    key={i}
                    className={`card overflow-hidden transition-all duration-200 ${
                      isSelected ? 'border-zinc-600' : isWinner ? 'border-green-500/40' : ''
                    }`}
                  >
                    {/* Outcome header - clickable */}
                    <button
                      onClick={() => {
                        if (isOpen && !placing) {
                          setSelectedOutcome(isSelected ? null : i)
                          if (!isSelected) setBetAmount('')
                        }
                      }}
                      className="w-full text-left p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isSelected ? 'bg-blue-500' : isWinner ? 'bg-green-500' : 'bg-zinc-700'}`} />
                          <h3 className="text-sm font-semibold">{o.name || `Outcome ${i + 1}`}</h3>
                          {isWinner && <span className="tag tag-green text-[10px]">Won</span>}
                          {myBet && <span className="tag tag-blue text-[10px]">Your Bet</span>}
                        </div>
                        <span className="text-xs font-mono tabular-nums text-zinc-400">{Number(formatEther(o.pool)).toFixed(2)} 0G</span>
                      </div>

                      {/* Probability bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="bar">
                            <div className={`bar-fill ${isWinner ? 'bar-green' : isSelected ? 'bar-blue' : 'bar-zinc'}`} style={{ width: `${Math.max(2, poolPct)}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-zinc-400 tabular-nums">{poolPct.toFixed(1)}%</span>
                          <span className="text-zinc-600">{getPayoutMultiplier(o.pool)}</span>
                        </div>
                      </div>
                    </button>

                    {/* Bet panel - visible when selected */}
                    {isSelected && isOpen && (
                      <div className="px-5 pb-5 pt-0 border-t border-zinc-800 mt-0">
                        <div className="pt-4 space-y-3">
                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5">Bet Amount (0G)</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                step="0.001"
                                min="0"
                                placeholder="0.00"
                                value={betAmount}
                                onChange={e => setBetAmount(e.target.value)}
                                className="input flex-1"
                              />
                              <button
                                onClick={handlePlaceBet}
                                disabled={!betAmount || Number(betAmount) <= 0 || placing}
                                className="btn btn-blue min-w-[100px]"
                              >
                                {placing ? 'Placing...' : 'Place Bet'}
                              </button>
                            </div>
                          </div>

                          {betAmount && Number(betAmount) > 0 && (
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                              <span>Pool share: <span className="text-zinc-300 tabular-nums">{poolPct.toFixed(1)}%</span></span>
                              <span>Est. payout: <span className="text-zinc-300 tabular-nums">{(Number(betAmount) * Number(totalPool) / Math.max(1, Number(o.pool || 1n))).toFixed(3)} 0G</span></span>
                              <span>Multiplier: <span className="text-zinc-300">{getPayoutMultiplier(o.pool)}</span></span>
                            </div>
                          )}

                          {txStatus && (
                            <div className={`px-3 py-2 rounded-lg text-xs ${txStatus.includes('Error') || txStatus.includes('failed') ? 'bg-red-500/10 text-red-400' : txStatus.includes('placed') || txStatus.includes('claimed') ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-300'}`}>
                              {txStatus}
                              {txHash && (
                                <a href={`${CHAIN.explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="ml-2 underline">View tx</a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selected on resolved - show claim inline */}
                    {isWinner && userBet && userBet.claimedAt === 0n && (
                      <div className="px-5 pb-5 pt-0">
                        <button onClick={handleClaim} disabled={claiming} className="btn btn-green w-full">
                          {claiming ? 'Claiming...' : 'Claim Reward'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* User bet summary */}
          {userBet && !isOpen && !isResolved && data.state !== 4 && (
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-2">Your bet on this market</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">{outcomes[Number(userBet.outcomeIndex)]?.name || 'Unknown'}</span>
                <span className="text-sm font-bold tabular-nums">{formatEther(userBet.amount)} 0G</span>
              </div>
            </div>
          )}

          {/* Resolution info + Activity */}
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

        {/* Right column: AI Analysis + Status */}
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
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Leading outcome</span>
                      <span className="text-zinc-300 font-medium">{leader?.name || 'N/A'}</span>
                    </div>
                    <div className="bar"><div className="bar-fill bar-blue" style={{ width: `${leaderPct}%` }} /></div>
                    <p className="text-xs text-zinc-500 mt-1">{leaderPct.toFixed(0)}% probability</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Confidence</span>
                      <span className="text-green-400 font-medium">{confidence}%</span>
                    </div>
                    <div className="bar"><div className="bar-fill bar-green" style={{ width: `${confidence}%` }} /></div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Risk</span>
                    <span className={`font-medium ${riskLevel === 'Low' ? 'text-green-400' : riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{riskLevel}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-3">
                  {sorted.length >= 2 && (
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {sorted[0].name} leads with {leaderPct.toFixed(0)}% of the pool. Contrarian bet on {sorted[sorted.length - 1].name} pays {getPayoutMultiplier(sorted[sorted.length - 1].pool)} if the unexpected occurs.
                    </p>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Status card */}
          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Market Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-zinc-500">Status</span><span>{MARKET_STATE_LABELS[data.state as 0|1|2|3|4]}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Outcomes</span><span>{outcomes.length}</span></div>
              {userBet && <div className="flex justify-between"><span className="text-zinc-500">Your bet</span><span className="tabular-nums">{formatEther(userBet.amount)} 0G</span></div>}
              {userBet?.claimedAt !== undefined && userBet.claimedAt > 0n && <div className="text-green-400 text-xs">Claimed</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
