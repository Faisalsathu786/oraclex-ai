'use client'

import { Shield, BarChart3 } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield size={28} className="text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">Platform management tools</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <p className="text-sm text-muted-foreground">
          Admin panel allows moderators to approve markets, manage users, configure treasury, and update platform branding.
          Access requires moderator role on the 0G Chain smart contract.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Contracts Deployed', value: '4', desc: 'AccessManager, Treasury, Market, Factory' },
          { label: 'Network', value: '0G Mainnet', desc: 'Chain ID: 16661' },
          { label: 'Protocol Fee', value: '2.5%', desc: 'Configurable by admin' },
          { label: 'Test Market', value: 'Created', desc: 'Cricket World Cup 2026' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.desc}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={32} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Admin Functions Active</h3>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          All admin contracts are deployed on 0G Mainnet. Market approval, user suspension,
          treasury management, treasury withdrawal, and branding customization can be performed
          via the deployed smart contracts.
        </p>
        <div className="glass-card inline-block p-3 mt-4 text-xs font-mono text-muted-foreground">
          AccessManager: 0xFd3F03b75C16BD7fb97C89d634AA26C484d2A7A0
        </div>
      </div>
    </div>
  )
}
