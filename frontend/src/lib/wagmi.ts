import { http, createConfig } from 'wagmi'
import { CHAIN } from '@/lib/config'

export const zeroGChain = {
  id: CHAIN.chainId,
  name: CHAIN.name,
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: { default: { http: [CHAIN.rpcUrl] } },
  blockExplorers: { default: { name: 'ChainScan', url: CHAIN.explorerUrl } },
}

export function getConfig(projectId: string) {
  return createConfig({
    chains: [zeroGChain],
    transports: { [zeroGChain.id]: http() },
  })
}
