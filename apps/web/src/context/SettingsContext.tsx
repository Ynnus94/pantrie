import { createContext, useContext, useState, ReactNode } from 'react'

interface SettingsContextType {
  weekStartDay: number // 0=Sunday, 1=Monday, etc.
  setWeekStartDay: (day: number) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Initialize week start day from localStorage (default to Saturday = 6)
  const [weekStartDay, setWeekStartDayState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('weekStartDay')
      return saved !== null ? parseInt(saved, 10) : 6 // Default to Saturday
    } catch (error) {
      return 6 // Default to Saturday
    }
  })

  // Save week start day to localStorage
  const setWeekStartDay = (day: number) => {
    setWeekStartDayState(day)
    try {
      localStorage.setItem('weekStartDay', day.toString())
    } catch (error) {
      console.error('Error saving week start day:', error)
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        weekStartDay,
        setWeekStartDay
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
