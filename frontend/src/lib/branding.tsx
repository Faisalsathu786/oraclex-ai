'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface BrandingConfig {
  logoUrl: string
  logoText: string
  primaryColor: string
  backgroundColor: string
  cardStyle: 'glass' | 'solid'
  heroImage: string
  faviconUrl: string
}

const defaultBranding: BrandingConfig = {
  logoUrl: '',
  logoText: 'OracleX AI',
  primaryColor: '#6c3bf5',
  backgroundColor: '#000000',
  cardStyle: 'glass',
  heroImage: '',
  faviconUrl: '',
}

interface BrandingContextType {
  branding: BrandingConfig
  updateBranding: (updates: Partial<BrandingConfig>) => void
  resetBranding: () => void
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  updateBranding: () => {},
  resetBranding: () => {},
})

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding)

  useEffect(() => {
    const stored = localStorage.getItem('oraclex-branding')
    if (stored) {
      try {
        setBranding({ ...defaultBranding, ...JSON.parse(stored) })
      } catch { /* ignore */ }
    }
  }, [])

  const updateBranding = (updates: Partial<BrandingConfig>) => {
    const newBranding = { ...branding, ...updates }
    setBranding(newBranding)
    localStorage.setItem('oraclex-branding', JSON.stringify(newBranding))
  }

  const resetBranding = () => {
    setBranding(defaultBranding)
    localStorage.removeItem('oraclex-branding')
  }

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}

export const useBranding = () => useContext(BrandingContext)
