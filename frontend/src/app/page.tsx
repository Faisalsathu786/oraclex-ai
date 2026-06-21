'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, Shield, Brain, Trophy, BarChart3, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 lg:py-32">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="mx-auto max-w-6xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap size={14} />
              Powered by 0G Ecosystem
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Predict the Future with
              <span className="gradient-text block mt-2">AI Precision</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create prediction markets, get AI-powered analysis, compete on leaderboards,
              and earn rewards. All secured by the 0G blockchain.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/markets" className="btn-primary text-lg px-8 py-4">
                Explore Markets
                <ArrowRight size={18} className="inline ml-2" />
              </Link>
              <Link href="/create" className="btn-secondary text-lg px-8 py-4">
                Create Market
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 -mt-8 relative z-20">
        <div className="glass-card grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            { label: 'Active Markets', value: '$2.4M' },
            { label: 'Total Volume', value: '$15.7M' },
            { label: 'Total Traders', value: '8.2K' },
            { label: 'AI Analyses', value: '12.5K' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-6 text-center"
            >
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.div className="text-center mb-12" {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Future</h2>
          <p className="text-muted-foreground text-lg">Every feature designed for the next generation of prediction markets</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              title: 'AI-Powered Analysis',
              desc: 'Every market includes AI-generated probability estimates with bull/bear case analysis and confidence scoring via 0G Compute.'
            },
            {
              icon: Shield,
              title: 'On-Chain Security',
              desc: 'Markets, bets, and rewards secured on 0G Chain with upgradeable smart contracts and role-based access control.'
            },
            {
              icon: BarChart3,
              title: 'Real-Time Analytics',
              desc: 'Live market statistics, dynamic odds, probability charts, and volume tracking with historical data.'
            },
            {
              icon: Trophy,
              title: 'Competitive Leaderboards',
              desc: 'Track wins, accuracy, XP, and reputation. Climb from Bronze to Diamond rank and earn exclusive badges.'
            },
            {
              icon: Users,
              title: 'Social Features',
              desc: 'Follow traders, share predictions, comment on markets, and build your reputation in the community.'
            },
            {
              icon: TrendingUp,
              title: 'Reward System',
              desc: 'Earn XP and reputation for participating. Top predictors earn badges and protocol rewards.'
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 0G Integration */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by 0G</h2>
            <p className="text-muted-foreground text-lg">Decentralized AI infrastructure at your fingertips</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '0G Chain', desc: 'Smart contracts for market creation, betting, settlement, and reward distribution with EVM compatibility.', icon: Shield },
              { title: '0G Storage', desc: 'Market metadata, AI analysis reports, images, and historical data stored permanently and verifiably.', icon: BarChart3 },
              { title: '0G Compute', desc: 'Decentralized AI inference for probability generation, bull/bear analysis, and AI debate mode.', icon: Brain },
            ].map((item) => (
              <motion.div key={item.title} {...fadeUp} className="glass-card p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                  <item.icon size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="glass-card gradient-border p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Predicting?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join the next generation of prediction markets powered by AI and blockchain technology.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/markets" className="btn-primary px-8 py-4 text-lg">Get Started</Link>
            <Link href="/leaderboard" className="btn-secondary px-8 py-4 text-lg">View Leaderboard</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">X</div>
            <span className="font-semibold gradient-text text-sm">OracleX AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="https://github.com/Faisalsathu786/oraclex-ai" target="_blank" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="https://0g.ai" target="_blank" className="hover:text-foreground transition-colors">0G</a>
            <span>Powered by 0G Ecosystem</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
