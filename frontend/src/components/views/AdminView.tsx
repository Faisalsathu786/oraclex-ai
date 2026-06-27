'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/components/web3/Web3Provider'
import { formatEther, parseEther } from 'ethers'
import {
  fetchAllMarkets,
  fetchMarketOutcomes,
  getFactoryContract,
  getTreasuryContract,
  getAccessManagerContract,
  getMarketContract,
  getRpcProvider,
  isOwner,
  MarketData,
  OutcomeData,
  MARKET_STATE_LABELS,
} from '@/lib/contracts'

const ADMIN_TABS = ['Overview', 'Markets', 'Users', 'Treasury', 'Settings']

export default function AdminView() {
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
      const count = await factory.marketCount()
      setMarketCount(Number(count))

      const all = await fetchAllMarkets()
      setMarkets(all)

      const treasury = getTreasuryContract(provider)
      const stats = await treasury.getStats()
      setTreasuryStats(stats)

      const ac = getAccessManagerContract(provider)
      const fee = await ac.protocolFee()
      setProtocolFee(fee)
      setFeeInput(formatEther(fee))
      const p = await ac.paused()
      setPaused(p)
    } catch (e) {
      console.error('Admin load error', e)
    }
    setLoading(false)
  }, [provider, address])

  useEffect(() => { loadData() }, [loadData])

  if (!address || !isOwner(address)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <p className="text-sm">Admin access restricted to platform owner</p>
      </div>
    )
  }

  const checkMod = async () => {
    if (!provider || !userAddress) return
    try {
      const ac = getAccessManagerContract(provider)
      const mod = await ac.isModerator(userAddress)
      setIsMod(mod)
    } catch { setIsMod(false) }
  }

  const approveMarket = async (marketAddr: string) => {
    if (!signer) return
    setTxStatus('Approving...')
    try {
      const mc = getMarketContract(marketAddr, signer)
      const tx = await mc.approveMarket()
      await tx.wait()
      setTxStatus('Market approved')
      loadData()
    } catch (e: any) { setTxStatus('Error: ' + (e.message?.slice(0, 60) || '')) }
  }

  const cancelMarket = async (marketAddr: string) => {
    if (!signer) return
    setTxStatus('Cancelling...')
    try {
      const mc = getMarketContract(marketAddr, signer)
      const tx = await mc.rejectMarket()
      await tx.wait()
      setTxStatus('Market cancelled')
      loadData()
    } catch (e: any) {
      const msg = e?.reason || e?.message || ''
      if (msg.includes('Not pending')) {
        setTxStatus('Error: Only pending markets can be cancelled.')
      } else {
        setTxStatus('Error: Transaction failed.')
      }
    }
  }

  const resolveMarketAction = async (marketAddr: string, winningOutcome: number) => {
    if (!signer) return
    setTxStatus('Resolving...')
    try {
      const mc = getMarketContract(marketAddr, signer)
      const tx = await mc.resolveMarket(winningOutcome)
      await tx.wait()
      setTxStatus('Market resolved')
      setResolvingAddr(null)
      setResolveOutcome(null)
      loadData()
    } catch (e: any) { setTxStatus('Error: ' + (e.message?.slice(0, 60) || '')) }
  }

  const fetchOutcomes = async (marketAddr: string) => {
    if (outcomesCache[marketAddr]) return outcomesCache[marketAddr]
    const outcomes = await fetchMarketOutcomes(marketAddr)
    setOutcomesCache(prev => ({ ...prev, [marketAddr]: outcomes }))
    return outcomes
  }

  const togglePause = async () => {
    if (!signer) return
    setTxStatus(paused ? 'Resuming...' : 'Pausing...')
    try {
      const ac = getAccessManagerContract(signer)
      const tx = await ac.pause(!paused)
      await tx.wait()
      setPaused(!paused)
      setTxStatus(paused ? 'Protocol resumed' : 'Protocol paused')
    } catch (e: any) { setTxStatus('Error: ' + (e.message?.slice(0, 60) || '')) }
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
    } catch (e: any) { setTxStatus('Error: ' + (e.message?.slice(0, 60) || '')) }
  }

  const toggleUser = async (addr: string, suspend: boolean) => {
    if (!signer) return
    setTxStatus(suspend ? 'Suspending...' : 'Unsuspending...')
    try {
      const ac = getAccessManagerContract(signer)
      const tx = await ac.suspendUser(addr, suspend)
      await tx.wait()
      setTxStatus(suspend ? 'User suspended' : 'User unsuspended')
    } catch (e: any) { setTxStatus('Error: ' + (e.message?.slice(0, 60) || '')) }
  }

  const pendingMarkets = markets.filter(m => m.data.state === 0)
  const openMarkets = markets.filter(m => m.data.state === 1)
  const lockedMarkets = markets.filter(m => m.data.state === 2)
  const resolvedMarkets = markets.filter(m => m.data.state === 3)
  const cancelledMarkets = markets.filter(m => m.data.state === 4)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-5"><div className="h-8 bg-zinc-800 rounded animate-pulse" /></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Admin Panel</h2>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto">
        {ADMIN_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              tab === t ? 'bg-zinc-700 text-white' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {txStatus && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-zinc-800/50 text-xs text-zinc-300 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={txStatus.includes('Error') ? 'text-red-400' : 'text-zinc-400'}><polyline points="20 6 9 17 4 12"/></svg>
          {txStatus}
        </div>
      )}

      {tab === 'Overview' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-1">Total Markets</p>
              <p className="text-2xl font-bold">{marketCount}</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-1">Pending</p>
              <p className="text-2xl font-bold">{pendingMarkets.length}</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-1">Open</p>
              <p className="text-2xl font-bold">{openMarkets.length}</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-1">Locked</p>
              <p className="text-2xl font-bold">{lockedMarkets.length}</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-1">Resolved</p>
              <p className="text-2xl font-bold">{resolvedMarkets.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-1">Collected Fees</p>
              <p className="text-xl font-bold tabular-nums">{formatEther(treasuryStats[0] || 0n).slice(0, 8)} 0G</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-1">Treasury Balance</p>
              <p className="text-xl font-bold tabular-nums">{formatEther(treasuryStats[2] || 0n).slice(0, 8)} 0G</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-zinc-500 mb-1">Protocol Status</p>
              <p className="text-xl font-bold">{paused ? 'Paused' : 'Active'}</p>
            </div>
          </div>
        </>
      )}

      {tab === 'Markets' && (
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 text-xs text-zinc-500 font-medium">Pending ({pendingMarkets.length})</div>
            {pendingMarkets.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-600 text-sm">No pending markets</div>
            ) : (
              pendingMarkets.map(m => (
                <div key={m.address} className="flex items-center justify-between gap-2 px-5 py-4 border-b border-zinc-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.data.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.data.category} · {m.data.creator.slice(0, 6)}...{m.data.creator.slice(-4)}</p>
                  </div>
                  <button onClick={() => approveMarket(m.address)} className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-600 transition-colors whitespace-nowrap">Approve</button>
                    <button onClick={() => cancelMarket(m.address)} className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors whitespace-nowrap ml-2">Cancel</button>
                </div>
              ))
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 text-xs text-zinc-500 font-medium">Open ({openMarkets.length})</div>
            {openMarkets.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-600 text-sm">No open markets</div>
            ) : (
              openMarkets.map(m => (
                <div key={m.address} className="flex items-center justify-between gap-2 px-5 py-4 border-b border-zinc-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.data.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.data.category} · {Number(m.data.participantCount)} bettors</p>
                  </div>
                  
                </div>
              ))
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 text-xs text-zinc-500 font-medium">Locked ({lockedMarkets.length})</div>
            {lockedMarkets.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-600 text-sm">No locked markets</div>
            ) : (
              lockedMarkets.map(m => {
                const isResolving = resolvingAddr === m.address
                const outcomes = outcomesCache[m.address] || []
                return (
                  <div key={m.address} className="px-5 py-4 border-b border-zinc-800 last:border-0">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.data.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{Number(formatEther(m.data.totalVolume))} 0G volume · {Number(m.data.participantCount)} bettors</p>
                      </div>
                      {!isResolving && (
                        <button onClick={async () => {
                          await fetchOutcomes(m.address)
                          setResolvingAddr(m.address)
                          setResolveOutcome(null)
                        }} className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-600 transition-colors whitespace-nowrap">Resolve</button>
                      )}
                    </div>
                    {isResolving && (
                      <div className="flex flex-col gap-2 bg-zinc-900 rounded-lg p-3">
                        <p className="text-xs text-zinc-400">Select winning outcome:</p>
                        <div className="flex flex-wrap gap-2">
                          {outcomes.map((o, oi) => (
                            <button
                              key={oi}
                              onClick={() => resolveMarketAction(m.address, oi)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${resolveOutcome === oi ? 'bg-zinc-600 border-zinc-500' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}
                            >
                              {o.name}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => { setResolvingAddr(null); setResolveOutcome(null) }} className="text-xs text-zinc-500 w-fit">Cancel</button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div className="text-xs text-zinc-600">Resolved: {resolvedMarkets.length} | Cancelled: {cancelledMarkets.length}</div>
        </div>
      )}

      {tab === 'Treasury' && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
            <span className="text-sm">Collected Fees</span>
            <span className="text-sm font-mono tabular-nums">{formatEther(treasuryStats[0] || 0n).slice(0, 8)} 0G</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
            <span className="text-sm">Distributed</span>
            <span className="text-sm font-mono tabular-nums">{formatEther(treasuryStats[1] || 0n).slice(0, 8)} 0G</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm">Treasury Balance</span>
            <span className="text-sm font-mono tabular-nums">{formatEther(treasuryStats[2] || 0n).slice(0, 8)} 0G</span>
          </div>
        </div>
      )}

      {tab === 'Settings' && (
        <div className="card p-5 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-4">Protocol Settings</h3>
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <span className="text-sm">Status</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${paused ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800 text-zinc-400'}`}>{paused ? 'Paused' : 'Active'}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm">Toggle</span>
              <button onClick={togglePause} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                {paused ? 'Resume Protocol' : 'Pause Protocol'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Protocol Fee</h3>
            <div className="flex items-center gap-3">
              <input type="text" value={feeInput} onChange={e => setFeeInput(e.target.value)} className="input text-sm w-32" />
              <span className="text-xs text-zinc-500">0G</span>
              <button onClick={updateFee} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">Update</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'Users' && (
        <div className="card p-5">
          <h3 className="text-sm font-medium mb-4">Moderator Management</h3>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="0x..."
              value={userAddress}
              onChange={e => setUserAddress(e.target.value)}
              className="input text-sm flex-1 font-mono"
            />
            <button onClick={checkMod} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">Check</button>
          </div>
          {isMod !== null && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">{isMod ? 'Moderator' : 'Not a moderator'}</span>
              {userAddress && (
                <button onClick={() => toggleUser(userAddress, isMod)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                  {isMod ? 'Remove Moderator' : 'Add Moderator'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
