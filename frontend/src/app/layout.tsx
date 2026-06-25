import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/web3/Web3Provider'
import { TabProvider } from '@/lib/tab-context'
import { Navbar } from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'OracleX — AI-Powered Prediction Markets on 0G',
  description: 'Predict future events, trade market outcomes, and leverage decentralized AI insights on the 0G blockchain.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'OracleX — AI-Powered Prediction Markets',
    description: 'Predict future events, trade market outcomes, and leverage decentralized AI insights on 0G.',
    type: 'website',
    siteName: 'OracleX',
  },
  twitter: {
    card: 'summary',
    title: 'OracleX — AI-Powered Prediction Markets',
    description: 'Predict future events, trade market outcomes, and leverage decentralized AI insights on 0G.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <Web3Provider>
          <TabProvider>
            <Navbar />
            {children}
          </TabProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
