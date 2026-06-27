'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/components/web3/Web3Provider'
import { formatEther } from 'ethers'
import {
  fetchAllMarkets,
  fetchMarketOutcomes,
  fetchUserBet,
  claimReward,
  getRpcProvider,
  getMarketContract,
  MarketData,
  MARKET_STATE_LABELS,
} from '@/lib/contracts'

export default function PortfolioView() {
  const { provider, address, signer } = useWallet()
  const [balance, setBalance] = useState('0')
  const [bets, setBets] = useState<{
    market: string
    address: string
    data: MarketData
    outcomeIndex: number
    outcomeName: string
    amount: bigint
    pool: bigint
    totalPool: bigint
    claimedAt: bigint
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingAddr, setClaimingAddr] = useState<string | null>(null)
  const [claimMsg, setClaimMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!address) return
      setLoading(true)
      try {
        const rpc = getRpcProvider()
        const bal = await rpc.getBalance(address)
        setBalance(Number(formatEther(bal)).toFixed(4))

        const all = await fetchAllMarkets()
        const userBets: typeof bets = []

        for (const m of all) {
          const bet = await fetchUserBet(m.address, address)
          if (bet && bet.amount > 0n) {
            const outcomes = await fetchMarketOutcomes(m.address)
            const oidx = Number(bet.outcomeIndex)
            const outcomeName = outcomes[oidx]?.name || 'Outcome ' + (oidx + 1)
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
  const otherBets = bets.filter(b => b.data.state !== 1 && b.data.state !== 3)

  const getOdds = (pool: bigint, totalPool: bigint): string => {
    if (totalPool === 0n) return '0'
    const ratio = Number(pool) * 100 / Number(totalPool)
    return ratio.toFixed(1)
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
          if (b.address === marketAddress) return { ...b, claimedAt: 1n }
          return b
        }))
        setClaimingAddr(null)
        setClaimMsg('')
      }, 1500)
    } catch (e: any) {
      setClaimMsg(e.message?.slice(0, 80) || 'Claim failed')
      setTimeout(() => { setClaimingAddr(null); setClaimMsg('') }, 3000)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="h-3 bg-zinc-800 rounded w-20 mb-3 animate-pulse" />
              <div className="h-6 bg-zinc-800 rounded w-24 animate-pulse" />
            </div>
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-zinc-800/50 rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-6">Portfolio</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4">
          <p className="text-xs text-zinc-500 mb-1">Wallet Balance</p>
          <p className="text-2xl font-bold tabular-nums text-white">{balance} <span className="text-xs font-normal text-zinc-500">0G</span></p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Invested</p>
          <p className="text-2xl font-bold tabular-nums text-white">{totalInvested.toFixed(4)} <span className="text-xs font-normal text-zinc-500">0G</span></p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-zinc-500 mb-1">Open Positions</p>
          <p className="text-2xl font-bold tabular-nums text-white">{openBets.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-zinc-500 mb-1">Resolved</p>
          <p className="text-2xl font-bold tabular-nums text-white">{resolvedBets.length}</p>
        </div>
      </div>

      {bets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-3 opacity-20"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          <p className="text-sm text-zinc-500">No positions yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {openBets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Open Positions</h3>
              <div className="space-y-3">
                {openBets.map((b) => (
                  <div key={b.address} className="glass-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{b.market}</p>
                        <p className="text-xs text-zinc-500 mt-1">{b.outcomeName} | {getOdds(b.pool, b.totalPool)}% pool share</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold tabular-nums text-white">{formatEther(b.amount)} <span className="text-xs font-normal text-zinc-500">0G</span></p>
                        <p className="text-xs text-zinc-600 mt-1">Potential: <span className="text-zinc-400 tabular-nums">{getPotentialWin(b.amount, b.pool, b.totalPool)} 0G</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedBets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Resolved</h3>
              <div className="space-y-2">
                {resolvedBets.map((b) => {
                  const won = Number(b.data.winningOutcome) === b.outcomeIndex
                  const isClaiming = claimingAddr === b.address
                  const isClaimed = b.claimedAt > 0n
                  return (
                    <div key={b.address} className={`glass-card p-4 border ${won ? 'border-zinc-700' : 'border-zinc-800'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${won ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800 text-zinc-500'}`}>
                            {won ? 'Won' : 'Lost'}
                          </span>
                          <span className="text-sm text-zinc-300 truncate">{b.market}</span>
                          <span className="text-xs text-zinc-500">{b.outcomeName}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-mono text-zinc-400 tabular-nums">{formatEther(b.amount)} 0G</span>
                          {won && <div className="text-xs text-zinc-400 mt-0.5">{getPotentialWin(b.amount, b.pool, b.totalPool)} 0G payout</div>}
                        </div>
                      </div>
                      {won && !isClaimed && (
                        <div className="mt-3 pt-3 border-t border-zinc-800">
                          {claimMsg && isClaiming ? (
                            <div className={`text-xs ${claimMsg === 'claimed' ? 'text-zinc-400' : 'text-red-400'}`}>
                              {claimMsg === 'claimed' ? 'Claimed' : claimMsg}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleClaim(b.address)}
                              disabled={isClaiming}
                              className="px-4 py-1.5 rounded-lg bg-zinc-700 text-white text-xs font-medium hover:bg-zinc-600 transition-colors disabled:opacity-40"
                            >
                              {isClaiming ? 'Claiming...' : 'Claim Reward'}
                            </button>
                          )}
                        </div>
                      )}
                      {won && isClaimed && (
                        <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-500">Reward claimed</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {otherBets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Pending & Locked</h3>
              <div className="space-y-2">
                {otherBets.map((b) => (
                  <div key={b.address} className="glass-card p-4 flex items-center justify-between opacity-70">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-zinc-500">{MARKET_STATE_LABELS[b.data.state as 0|1|2|3|4] || 'Unknown'}</span>
                      <span className="text-sm text-zinc-300 truncate">{b.market}</span>
                      <span className="text-xs text-zinc-600">{b.outcomeName}</span>
                    </div>
                    <span className="text-sm font-mono text-zinc-400 tabular-nums">{formatEther(b.amount)} 0G</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
