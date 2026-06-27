'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useWallet } from '@/components/web3/Web3Provider'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWallet()

  // Show landing page without sidebar when not connected
  if (!isConnected) {
    return <>{children}</>
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
