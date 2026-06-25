'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface TabContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabContext = createContext<TabContextType>({
  activeTab: 'Markets',
  setActiveTab: () => {},
})

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('Markets')
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTab() {
  return useContext(TabContext)
}
