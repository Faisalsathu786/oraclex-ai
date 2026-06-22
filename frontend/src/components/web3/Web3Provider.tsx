'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { getConfig } from '@/lib/wagmi'

const WC_PROJECT_ID = 'e65e0e8ee0b354919610b744401ec152'
const queryClient = new QueryClient()
const wagmiConfig = getConfig(WC_PROJECT_ID)

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
