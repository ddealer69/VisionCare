import { useEffect, useState } from 'react'
import { useSession } from '../contexts/SessionContext'
import { apiService } from '../utils/api'
import type { Session } from '../types'

const SessionLogs = () => {
  const { currentSession } = useSession()
  const [savedSessions, setSavedSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')

  // Load saved sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.getSessions()
        setSavedSessions((response as any).sessions || [])
      } catch (error) {
        console.error('Failed to load sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (activeTab === 'history') {
      loadSessions()
    }
  }, [activeTab])

  const loadSessionDetails = async (sessionId: string) => {
    try {
      const response = await apiService.getSessionDetails(sessionId)
      setSelectedSession(response as Session)
    } catch (error) {
      console.error('Failed to load session details:', error)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded-l-lg font-medium transition-colors ${
            activeTab === 'current'
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          Current Session
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-r-lg font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          Session History
        </button>
      </div>

      {/* Current Session Tab */}
      {activeTab === 'current' && (
        <div className="flex-1 overflow-y-auto">
          {currentSession ? (
            <div className="space-y-4">
              {/* Session Info */}
              <div className="bg-white/5 rounded-lg p-3">
                <h3 className="font-semibold text-white mb-2">Session Info</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>ID: {currentSession.sessionId}</div>
                  <div>Started: {formatDateTime(currentSession.startTime)}</div>
                  <div>Total Blinks: {currentSession.stats.totalBlinks}</div>
                  <div>Avg BPM: {currentSession.stats.averageBpm.toFixed(1)}</div>
                </div>
              </div>

              {/* Recent Blink Data */}
              <div className="bg-white/5 rounded-lg p-3">
                <h3 className="font-semibold text-white mb-2">Recent Activity</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentSession.blinkData.length > 0 ? (
                    currentSession.blinkData.slice(-10).reverse().map((data, index) => (
                      <div key={index} className="text-xs text-gray-300 flex justify-between">
                        <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
                        <span>{data.bpm} BPM</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No data recorded yet</div>
                  )}
                </div>
              </div>

              {/* Analysis Results */}
              <div className="bg-white/5 rounded-lg p-3">
                <h3 className="font-semibold text-white mb-2">Analysis Results</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {currentSession.analysisResults.length > 0 ? (
                    currentSession.analysisResults.slice(-5).reverse().map((result, index) => (
                      <div key={index} className="text-xs text-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="capitalize">{result.type.replace('_', ' ')}</span>
                          <span className="text-gray-400">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No analysis performed yet</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-2xl mb-2">📝</div>
                <p className="text-gray-300">No active session</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session History Tab */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : savedSessions.length > 0 ? (
            <div className="space-y-2">
              {savedSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-colors"
                  onClick={() => loadSessionDetails(session.sessionId)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium text-sm">
                        {session.sessionId}
                      </div>
                      <div className="text-gray-300 text-xs">
                        {formatDateTime(session.startTime)}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-300">
                      <div>{session.stats.totalBlinks} blinks</div>
                      <div>{session.stats.averageBpm.toFixed(1)} avg BPM</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-2xl mb-2">📂</div>
                <p className="text-gray-300">No saved sessions</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSession(null)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Session Details</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <h4 className="text-white font-medium mb-2">Statistics</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>Total Blinks: {selectedSession.stats.totalBlinks}</div>
                  <div>Average BPM: {selectedSession.stats.averageBpm.toFixed(2)}</div>
                  <div>Duration: {formatDuration(selectedSession.stats.sessionDuration)}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Blink Data Points</h4>
                <div className="text-xs text-gray-300 space-y-1 max-h-32 overflow-y-auto">
                  {selectedSession.blinkData.slice(-10).map((data, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
                      <span>{data.bpm} BPM</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionLogs