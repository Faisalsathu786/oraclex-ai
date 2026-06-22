'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, ReactNode } from 'react'
import { getConfig } from '@/lib/wagmi'

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    const pid = localStorage.getItem('wc_project_id') || process.env.NEXT_PUBLIC_WC_PROJECT_ID
    if (pid) {
      setConfig(getConfig(pid))
    }
  }, [])

  if (!config) return <>{children}</>

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
