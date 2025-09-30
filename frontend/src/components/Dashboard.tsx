import { useState } from 'react'
import WebcamFeed from './WebcamFeed'
import StatsPanel from './StatsPanel'
import BlinkChart from './BlinkChart'
import SessionLogs from './SessionLogs'
import { useSession } from '../contexts/SessionContext'

const Dashboard = () => {
  const [showLogs, setShowLogs] = useState(false)
  const { isSessionActive, startSession, saveSession } = useSession()

  const handleStartSession = async () => {
    await startSession()
  }

  const handleStopSession = async () => {
    await saveSession()
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">VisionCare</h1>
            <p className="text-blue-100">Real-time eye tracking and blink detection</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              {showLogs ? 'Hide' : 'Show'} Logs
            </button>
            {!isSessionActive ? (
              <button
                onClick={handleStartSession}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                Start Session
              </button>
            ) : (
              <button
                onClick={handleStopSession}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                Stop Session
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Main Content Area */}
        <div className={`${showLogs ? 'lg:col-span-9' : 'lg:col-span-12'} grid grid-cols-1 lg:grid-cols-3 gap-6`}>
          {/* Webcam Feed - Left */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 h-full">
              <h2 className="text-xl font-semibold text-white mb-4">Live Video Feed</h2>
              <WebcamFeed />
            </div>
          </div>

          {/* Stats Panel - Right */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 h-full">
              <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
              <StatsPanel />
            </div>
          </div>

          {/* Chart - Bottom Full Width */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 h-64">
              <h2 className="text-xl font-semibold text-white mb-4">Blink Rate Over Time</h2>
              <BlinkChart />
            </div>
          </div>
        </div>

        {/* Session Logs Sidebar */}
        {showLogs && (
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 h-full">
              <h2 className="text-xl font-semibold text-white mb-4">Session Logs</h2>
              <SessionLogs />
            </div>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="fixed bottom-4 right-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isSessionActive 
            ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
            : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
        } backdrop-blur-sm`}>
          <div className={`w-2 h-2 rounded-full ${
            isSessionActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`}></div>
          {isSessionActive ? 'Session Active' : 'Session Inactive'}
        </div>
      </div>
    </div>
  )
}

export default Dashboard