import { Contract, BrowserProvider, JsonRpcSigner, JsonRpcProvider, formatEther, parseEther } from 'ethers'
import { CONTRACTS, CHAIN } from './config'
import { FACTORY_ABI, MARKET_ABI, ACCESS_MANAGER_ABI, TREASURY_ABI } from './abis/contracts'

// Read-only RPC provider for contract reads (doesn't require user wallet)
let _rpcProvider: JsonRpcProvider | null = null
export function getRpcProvider(): JsonRpcProvider {
  if (!_rpcProvider) {
    _rpcProvider = new JsonRpcProvider(CHAIN.rpcUrl, undefined, { staticNetwork: true })
  }
  return _rpcProvider
}

export type MarketState = 0 | 1 | 2 | 3 | 4

export const MARKET_STATE_LABELS: Record<MarketState, string> = {
  0: 'Pending',
  1: 'Open',
  2: 'Locked',
  3: 'Resolved',
  4: 'Cancelled',
}

export const MARKET_STATE_COLORS: Record<MarketState, string> = {
  0: 'text-yellow-400 bg-yellow-500/10',
  1: 'text-emerald-400 bg-emerald-500/10',
  2: 'text-orange-400 bg-orange-500/10',
  3: 'text-blue-400 bg-blue-500/10',
  4: 'text-red-400 bg-red-500/10',
}

export interface MarketData {
  address: string
  id: bigint
  title: string
  description: string
  category: string
  imageUrl: string
  creator: string
  state: MarketState
  endDate: bigint
  createdAt: bigint
  totalVolume: bigint
  participantCount: bigint
  winningOutcome: bigint
  resolved: boolean
}

export interface OutcomeData {
  name: string
  pool: bigint
}

export interface BetData {
  user: string
  outcomeIndex: bigint
  amount: bigint
  claimedAt: bigint
}

export function getFactoryContract(signerOrProvider: JsonRpcSigner | BrowserProvider | JsonRpcProvider) {
  return new Contract(CONTRACTS.factory, FACTORY_ABI, signerOrProvider)
}

export function getMarketContract(address: string, signerOrProvider: JsonRpcSigner | BrowserProvider | JsonRpcProvider) {
  return new Contract(address, MARKET_ABI, signerOrProvider)
}

export function getAccessManagerContract(signerOrProvider: JsonRpcSigner | BrowserProvider | JsonRpcProvider) {
  return new Contract(CONTRACTS.accessManager, ACCESS_MANAGER_ABI, signerOrProvider)
}

export function getTreasuryContract(signerOrProvider: JsonRpcSigner | BrowserProvider | JsonRpcProvider) {
  return new Contract(CONTRACTS.treasury, TREASURY_ABI, signerOrProvider)
}

export async function fetchAllMarkets(provider?: BrowserProvider): Promise<{ address: string; data: MarketData }[]> {
  const rpc = provider || getRpcProvider()
  const factory = getFactoryContract(rpc)
  let count: bigint
  try {
    count = await factory.marketCount()
  } catch {
    return []  // Return empty if contract call fails
  }
  const markets: { address: string; data: MarketData }[] = []

  for (let i = 0; i < Number(count); i++) {
    try {
      const addr: string = await factory.allMarkets(i)
      // Skip zero-address entries (markets that don't exist at this array index)
      if (!addr || addr === '0x0000000000000000000000000000000000000000') continue
      const mc = getMarketContract(addr, rpc)
      const raw = await mc.market()

      const data: MarketData = {
        address: addr,
        id: raw.id,
        title: raw.title || '',
        description: raw.description || '',
        category: raw.category || '',
        imageUrl: raw.imageUrl || '',
        creator: raw.creator || '',
        state: Number(raw.state) as MarketState,
        endDate: raw.endDate,
        createdAt: raw.createdAt,
        totalVolume: raw.totalVolume,
        participantCount: raw.participantCount,
        winningOutcome: raw.winningOutcome,
        resolved: raw.resolved,
      }
      markets.push({ address: addr, data })
    } catch (e) {
      console.error(`Failed to fetch market at index ${i}:`, e)
    }
  }

  return markets
}

export async function fetchMarketOutcomes(address: string, provider?: BrowserProvider): Promise<OutcomeData[]> {
  const rpc = provider || getRpcProvider()
  const mc = getMarketContract(address, rpc)
  const raw = await mc.getOutcomes()
  return raw.map((o: any) => ({
    name: o.name || '',
    pool: o.pool,
  }))
}

export async function fetchUserBet(address: string, userAddress: string, provider?: BrowserProvider): Promise<BetData | null> {
  const rpc = provider || getRpcProvider()
  const mc = getMarketContract(address, rpc)
  const hasBet = await mc.hasBet(userAddress)
  if (!hasBet) return null
  const raw = await mc.bets(userAddress)
  return {
    user: raw.user,
    outcomeIndex: raw.outcomeIndex,
    amount: raw.amount,
    claimedAt: raw.claimedAt,
  }
}

export async function placeBet(marketAddress: string, outcomeIndex: number, amount: string, signer: JsonRpcSigner): Promise<string> {
  const mc = getMarketContract(marketAddress, signer)
  const tx = await mc.placeBet(outcomeIndex, { value: parseEther(amount) })
  await tx.wait()
  return tx.hash
}

export async function claimReward(marketAddress: string, signer: JsonRpcSigner): Promise<string> {
  const mc = getMarketContract(marketAddress, signer)
  const tx = await mc.claimReward()
  await tx.wait()
  return tx.hash
}

export async function fetchUserHasBet(marketAddress: string, userAddress: string, provider?: BrowserProvider): Promise<boolean> {
  const rpc = provider || getRpcProvider()
  const mc = getMarketContract(marketAddress, rpc)
  return await mc.hasBet(userAddress)
}

export async function resolveMarket(marketAddress: string, winningOutcome: number, signer: JsonRpcSigner): Promise<string> {
  const mc = getMarketContract(marketAddress, signer)
  const tx = await mc.resolveMarket(winningOutcome)
  await tx.wait()
  return tx.hash
}

export async function rejectMarket(marketAddress: string, signer: JsonRpcSigner): Promise<string> {
  const mc = getMarketContract(marketAddress, signer)
  const tx = await mc.rejectMarket()
  await tx.wait()
  return tx.hash
}

export const OWNER_WALLET = '0xd2b0082c89516fd2349df1179200e1b57c803119'.toLowerCase()

export function isOwner(address: string): boolean {
  return address.toLowerCase() === OWNER_WALLET
}

export async function isSuperAdmin(address: string, provider: BrowserProvider): Promise<boolean> {
  try {
    const ac = getAccessManagerContract(provider)
    return await ac.isSuperAdmin(address)
  } catch {
    return false
  }
}

export const CATEGORIES = ['All', 'Crypto', 'Sports', 'DeFi', 'Politics']
