import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Session, BlinkData, AnalysisResult, SessionStats } from '../types'
import { apiService } from '../utils/api'

interface SessionContextType {
  currentSession: Session | null
  isSessionActive: boolean
  startSession: () => Promise<void>
  saveSession: () => Promise<void>
  logBlinkData: (data: Omit<BlinkData, 'timestamp'>) => void
  logAnalysisResult: (result: AnalysisResult) => void
  updateStats: (stats: Partial<SessionStats>) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [isSessionActive, setIsSessionActive] = useState(false)

  const startSession = useCallback(async () => {
    try {
      const response = await apiService.startSession()
      const newSession: Session = {
        sessionId: (response as any).session_id,
        startTime: new Date().toISOString(),
        blinkData: [],
        analysisResults: [],
        stats: {
          totalBlinks: 0,
          averageBpm: 0,
          sessionDuration: 0
        }
      }
      setCurrentSession(newSession)
      setIsSessionActive(true)
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }, [])

  const saveSession = useCallback(async () => {
    if (!currentSession) return
    
    try {
      await apiService.saveSession()
      setIsSessionActive(false)
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }, [currentSession])

  const logBlinkData = useCallback((data: Omit<BlinkData, 'timestamp'>) => {
    if (!currentSession) return

    const blinkData: BlinkData = {
      ...data,
      timestamp: new Date().toISOString()
    }

    setCurrentSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        blinkData: [...prev.blinkData, blinkData]
      }
    })

    // Send to backend
    apiService.logBlinkData(data).catch(console.error)
  }, [currentSession])

  const logAnalysisResult = useCallback((result: AnalysisResult) => {
    if (!currentSession) return

    setCurrentSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        analysisResults: [...prev.analysisResults, result]
      }
    })
  }, [currentSession])

  const updateStats = useCallback((stats: Partial<SessionStats>) => {
    if (!currentSession) return

    setCurrentSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        stats: { ...prev.stats, ...stats }
      }
    })
  }, [currentSession])

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        isSessionActive,
        startSession,
        saveSession,
        logBlinkData,
        logAnalysisResult,
        updateStats
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}