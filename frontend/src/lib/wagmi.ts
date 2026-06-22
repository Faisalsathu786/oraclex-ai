import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
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
    connectors: [
      injected(),
      walletConnect({ projectId }),
    ],
    transports: {
      [zeroGChain.id]: http(),
    },
  })
}
