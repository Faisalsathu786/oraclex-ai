'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'

interface WalletState {
  address: string
  chainId: number
  isConnecting: boolean
  isConnected: boolean
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
  provider: BrowserProvider | null
  signer: JsonRpcSigner | null
  isOwnerWallet: boolean
}

const CHAIN_ID_HEX = '0x4115'
const OWNER = '0xd2b0082c89516fd2349df1179200e1b57c803119'.toLowerCase()

const defaultState: WalletContextType = {
  address: '',
  chainId: 0,
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  provider: null,
  signer: null,
  isOwnerWallet: false,
}

const WalletContext = createContext<WalletContextType>(defaultState)
export const useWallet = () => useContext(WalletContext)

// eslint-disable-next-line
function getEth(): any {
  return (typeof window !== 'undefined' && (window as any).ethereum) || null
}

async function ensureCorrectChain() {
  const eth = getEth()
  if (!eth) return
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_ID_HEX }],
    })
  } catch (e: any) {
    if (e.code === 4902) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: CHAIN_ID_HEX,
          chainName: '0G Mainnet (Aristotle)',
          nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
          rpcUrls: ['https://evmrpc.0g.ai'],
          blockExplorerUrls: ['https://chainscan.0g.ai'],
        }],
      })
    }
  }
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)

  const isConnected = !!address
  const isOwnerWallet = isConnected && address.toLowerCase() === OWNER

  const setupProvider = useCallback(async (accounts: string[]) => {
    const eth = getEth()
    if (!accounts[0] || !eth) {
      setAddress('')
      setSigner(null)
      setProvider(null)
      setChainId(0)
      return
    }
    try {
      const bp = new BrowserProvider(eth)
      setProvider(bp)
      setAddress(accounts[0])
      const s = await bp.getSigner()
      setSigner(s)
      const net = await bp.getNetwork()
      setChainId(Number(net.chainId))
    } catch (e) {
      console.error('Provider setup failed', e)
    }
  }, [])

  const connect = useCallback(async () => {
    const eth = getEth()
    if (!eth) {
      alert('Please install MetaMask to use OracleX')
      return
    }
    setIsConnecting(true)
    try {
      await ensureCorrectChain()
      const accounts = await eth.request({ method: 'eth_requestAccounts' })
      await setupProvider(accounts)
    } catch (e) {
      console.error('Connect failed', e)
    }
    setIsConnecting(false)
  }, [setupProvider])

  const disconnect = useCallback(() => {
    setAddress('')
    setSigner(null)
    setProvider(null)
    setChainId(0)
  }, [])

  useEffect(() => {
    const eth = getEth()
    if (!eth) return

    eth.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => { if (accounts[0]) setupProvider(accounts) })
      .catch(() => {})

    const handleAccounts = (accs: string[]) => {
      if (accs[0]) setupProvider(accs)
      else disconnect()
    }
    const handleChain = () => window.location.reload()

    eth.on('accountsChanged', handleAccounts)
    eth.on('chainChanged', handleChain)

    return () => {
      eth.removeListener('accountsChanged', handleAccounts)
      eth.removeListener('chainChanged', handleChain)
    }
  }, [setupProvider, disconnect])

  return (
    <WalletContext.Provider value={{
      address, chainId, isConnecting, isConnected,
      connect, disconnect, provider, signer, isOwnerWallet,
    }}>
      {children}
    </WalletContext.Provider>
  )
}
