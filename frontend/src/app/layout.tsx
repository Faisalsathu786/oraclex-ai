import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/web3/Web3Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OracleX AI - Prediction Markets on 0G',
  description: 'AI-powered prediction market platform on the 0G ecosystem',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
