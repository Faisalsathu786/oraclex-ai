interface Window {
  ethereum?: {
    isMetaMask?: boolean
    on: (event: string, callback: (...args: any[]) => void) => void
    removeListener: (event: string, callback: (...args: any[]) => void) => void
    request: (args: { method: string; params?: any[] }) => Promise<any>
  }
}
