import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { CHAIN } from '@/lib/config'

export const zeroGChain = {
  id: CHAIN.chainId,
  name: CHAIN.name,
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: { default: { http: [CHAIN.rpcUrl] } },
  blockExplorers: { default: { name: 'ChainScan', url: CHAIN.explorerUrl } },
}

export const wagmiConfig = createConfig({
  chains: [zeroGChain],
  connectors: [injected()],
  transports: { [zeroGChain.id]: http() },
})
