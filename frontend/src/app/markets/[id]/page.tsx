'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Brain, Clock, Users, BarChart3 } from 'lucide-react'

export default function MarketDetailPage() {
  return (
    <div className="max-w-7xl">
      <Link href="/markets" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Markets
      </Link>

      <div className="glass-card p-12 text-center max-w-2xl mx-auto mt-12">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
          <BarChart3 size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Market Detail</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Individual market pages will display live data from 0G Chain once markets are created and approved by moderators.
          The core smart contracts are deployed and operational.
        </p>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">Deployed Contracts:</span>
          </p>
          <div className="glass-card p-3 text-xs font-mono text-muted-foreground space-y-1">
            <p>AccessManager: 0xFd3F03b75C16BD7fb97C89d634AA26C484d2A7A0</p>
            <p>Factory: 0xb948466cf5c6da634C9D5ad85f6a133267aD7030</p>
            <p>Treasury: 0xe83F0A373EadE57899f07A457211dedeE85b3F4D</p>
          </div>
          <Link href="https://chainscan.0g.ai/address/0xb948466cf5c6da634C9D5ad85f6a133267aD7030" target="_blank" className="btn-primary inline-block mt-4">
            View on 0G Chain Explorer
          </Link>
        </div>
      </div>
    </div>
  )
}
