'use client'

import { useState } from 'react'
import { BarChart3, Users, Settings, Shield, TrendingUp, DollarSign, Flag, PieChart, Activity, Gavel, X } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = ['Overview', 'Markets', 'Users', 'Treasury', 'Branding', 'Settings']

const pendingMarkets = [
  { id: 1, title: 'BTC reaches $200K?', creator: '0x1234...5678', category: 'Crypto', createdAt: '2 hours ago' },
  { id: 2, title: 'ETH ETF $10B volume', creator: '0x8765...4321', category: 'Crypto', createdAt: '5 hours ago' },
  { id: 3, title: 'Pakistan wins World Cup', creator: '0xabcd...efgh', category: 'Sports', createdAt: '1 day ago' },
]

const users = [
  { id: 1, name: 'CryptoWhale', address: '0x1234...5678', bets: 147, points: 1240, status: 'Active' },
  { id: 2, name: 'AI Prophet', address: '0x8765...4321', bets: 132, points: 980, status: 'Active' },
  { id: 3, name: 'Market Sage', address: '0xabcd...efgh', bets: 88, points: 620, status: 'Suspended' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield size={28} className="text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">Manage platform, markets, users, and treasury</p>
      </div>

      <div className="flex gap-1 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Total Markets', value: '12', icon: BarChart3, change: '+3 this week' },
              { label: 'Total Users', value: '8.2K', icon: Users, change: '+124 today' },
              { label: 'Total Volume', value: '$15.7M', icon: DollarSign, change: '+$2.1M this month' },
              { label: 'Treasury Balance', value: '$42.5K', icon: TrendingUp, change: '2.5% fee collected' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon size={20} className="text-primary" />
                  <span className="text-xs text-success">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity size={18} className="text-primary" />Recent Activity</h3>
              {[
                'Market "ETH ETF Volume" approved by moderator',
                'User "CryptoWhale" reached Diamond rank',
                'Treasury withdrawal of $5,000 processed',
                'New market created: BTC reaches $200K?',
                'User "Market Sage" suspended for suspicious activity',
              ].map((activity, i) => (
                <div key={i} className="py-2 border-b border-border last:border-0 text-sm">
                  <span className="text-muted-foreground">{activity}</span>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><PieChart size={18} className="text-primary" />Quick Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Markets Pending Approval', value: '3' },
                  { label: 'Active Markets', value: '8' },
                  { label: 'Markets Awaiting Resolution', value: '2' },
                  { label: 'Users Suspended', value: '1' },
                  { label: 'Total Points Distributed', value: '45,820' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Markets' && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Flag size={18} className="text-primary" />Pending Markets</h3>
            <span className="badge-warning">{pendingMarkets.length} pending</span>
          </div>
          <div className="divide-y divide-border">
            {pendingMarkets.map((m) => (
              <div key={m.id} className="p-6 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                <div className="flex-1">
                  <h4 className="font-semibold">{m.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{m.category}</span>
                    <span>{m.creator}</span>
                    <span>{m.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-xl bg-success/20 text-success font-medium text-sm hover:bg-success/30 transition-colors">
                    Approve
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-destructive/20 text-destructive font-medium text-sm hover:bg-destructive/30 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Users' && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2"><Users size={18} className="text-primary" />User Management</h3>
          </div>
          <div className="divide-y divide-border">
            {users.map((user) => (
              <div key={user.id} className="p-6 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{user.name}</h4>
                    <span className={`text-xs font-medium ${user.status === 'Suspended' ? 'text-destructive' : 'text-success'}`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{user.address}</span>
                    <span>{user.bets} bets</span>
                    <span>{user.points} points</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.status === 'Active' ? (
                    <button className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-sm hover:bg-destructive/30 transition-colors">
                      Suspend
                    </button>
                  ) : (
                    <button className="px-3 py-1.5 rounded-lg bg-success/20 text-success text-sm hover:bg-success/30 transition-colors">
                      Unsuspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Treasury' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Total Collected', value: '$52,450', icon: DollarSign },
              { label: 'Total Distributed', value: '$9,950', icon: TrendingUp },
              { label: 'Current Balance', value: '$42,500', icon: Shield },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <stat.icon size={24} className="text-primary mb-3" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Fee Settings</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Protocol Fee (basis points)</label>
                <input type="number" defaultValue="250" className="input-field" />
              </div>
              <button className="btn-primary">Update Fee</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Branding' && (
        <div className="max-w-2xl space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">Project Branding</h3>
            <p className="text-sm text-muted-foreground mb-6">Customize how OracleX AI looks to all users. Changes applied instantly.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Logo Text</label>
                  <input type="text" defaultValue="OracleX AI" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Logo Image URL</label>
                  <input type="url" placeholder="https://example.com/logo.png" className="input-field" />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to use text logo</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Favicon URL</label>
                  <input type="url" placeholder="https://example.com/favicon.ico" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Primary Theme Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" defaultValue="#6c3bf5" className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border" />
                    <span className="text-sm font-mono text-muted-foreground">#6c3bf5</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Background Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" defaultValue="#0a0a1a" className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border" />
                    <span className="text-sm font-mono text-muted-foreground">#0a0a1a</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Hero Background Image URL</label>
                  <input type="url" placeholder="https://example.com/hero.jpg" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Card Style</label>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Glass</button>
                    <button className="px-4 py-2 rounded-xl bg-secondary text-muted-foreground text-sm font-medium">Solid</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold mb-2">Preview</h4>
              <div className="glass-card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">X</div>
                <div>
                  <div className="font-semibold">OracleX AI</div>
                  <div className="text-xs text-muted-foreground">Changes appear immediately to all users</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button className="btn-primary">Save Branding</button>
              <button className="btn-secondary">Reset to Default</button>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="glass-card p-6 max-w-2xl space-y-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Settings size={18} className="text-primary" />Protocol Settings</h3>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-sm">Protocol Active</span>
            <button className="w-12 h-6 rounded-full bg-success relative">
              <div className="w-5 h-5 rounded-full bg-white absolute right-0.5 top-0.5" />
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-sm">Emergency Mode</span>
            <button className="btn-primary py-1 px-4 text-sm">Pause Protocol</button>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm">Auto-Market Resolution</span>
            <button className="w-12 h-6 rounded-full bg-secondary relative">
              <div className="w-5 h-5 rounded-full bg-white absolute left-0.5 top-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
