import { useEffect, useState } from 'react'
import { useSession } from '../contexts/SessionContext'
import type { BlinkStats } from '../types'

const StatsPanel = () => {
  const { currentSession, isSessionActive } = useSession()
  const [sessionDuration, setSessionDuration] = useState(0)
  const [mockStats, setMockStats] = useState<BlinkStats>({
    totalBlinks: 0,
    currentBpm: 0,
    averageBpm: 0,
    blinkRate: 'normal',
    lastBlinkTime: 0
  })

  // Update session duration timer
  useEffect(() => {
    let interval: number | null = null

    if (isSessionActive && currentSession) {
      interval = window.setInterval(() => {
        const startTime = new Date(currentSession.startTime).getTime()
        const now = Date.now()
        const duration = Math.floor((now - startTime) / 1000)
        setSessionDuration(duration)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSessionActive, currentSession])

  // Mock stats for demonstration
  useEffect(() => {
    if (!isSessionActive) return

    const interval = setInterval(() => {
      setMockStats(prev => {
        const newBlinks = prev.totalBlinks + (Math.random() > 0.7 ? 1 : 0)
        const currentBpm = Math.floor(12 + Math.random() * 8) // 12-20 BPM
        const averageBpm = Math.floor(15 + Math.random() * 3) // 15-18 BPM
        
        let blinkRate: 'low' | 'normal' | 'high' = 'normal'
        if (currentBpm < 10) blinkRate = 'low'
        else if (currentBpm > 20) blinkRate = 'high'

        return {
          totalBlinks: newBlinks,
          currentBpm,
          averageBpm,
          blinkRate,
          lastBlinkTime: Date.now()
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isSessionActive])

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getBlinkRateColor = (rate: string) => {
    switch (rate) {
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'high': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      default: return 'text-green-400 bg-green-400/10 border-green-400/20'
    }
  }

  const getBlinkRateIcon = (rate: string) => {
    switch (rate) {
      case 'low': return '👁️'
      case 'high': return '😴'
      default: return '✅'
    }
  }

  // Mock stats for demonstration - using mockStats directly instead of stats variable
  // const stats = currentSession?.blinkData?.length ? currentSession.blinkData[currentSession.blinkData.length - 1] : mockStats

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Session Status */}
      <div className="bg-white/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Session Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isSessionActive 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {isSessionActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Duration:</span>
            <span className="text-white font-mono">{formatDuration(sessionDuration)}</span>
          </div>
        </div>
      </div>

      {/* Blink Statistics */}
      <div className="bg-white/5 rounded-lg p-4 flex-1">
        <h3 className="text-lg font-semibold text-white mb-3">Blink Statistics</h3>
        
        <div className="space-y-4">
          {/* Total Blinks */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Blinks</span>
              <span className="text-2xl font-bold text-white">{mockStats.totalBlinks}</span>
            </div>
          </div>

          {/* Current BPM */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Current BPM</span>
              <span className="text-2xl font-bold text-blue-300">{mockStats.currentBpm}</span>
            </div>
            <div className="mt-1 w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((mockStats.currentBpm / 30) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Average BPM */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Average BPM</span>
              <span className="text-xl font-semibold text-green-300">{mockStats.averageBpm}</span>
            </div>
          </div>

          {/* Blink Rate Status */}
          <div className={`rounded-lg p-3 border ${getBlinkRateColor(mockStats.blinkRate)}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getBlinkRateIcon(mockStats.blinkRate)}</span>
              <div>
                <div className="font-semibold capitalize">{mockStats.blinkRate} Rate</div>
                <div className="text-xs opacity-80">
                  {mockStats.blinkRate === 'low' && 'Try to blink more frequently'}
                  {mockStats.blinkRate === 'high' && 'You might need a break'}
                  {mockStats.blinkRate === 'normal' && 'Healthy blink pattern'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-white/5 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-2">💡 Tips</h3>
        <div className="text-xs text-gray-300 space-y-1">
          <p>• Normal blink rate: 12-20 per minute</p>
          <p>• Take breaks every 20 minutes</p>
          <p>• Stay hydrated for healthy eyes</p>
        </div>
      </div>
    </div>
  )
}

export default StatsPanel