import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import { SessionProvider } from './contexts/SessionContext'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-4xl font-bold text-white mb-2">VisionCare</h1>
          <p className="text-blue-100">Initializing eye tracking system...</p>
        </div>
      </div>
    )
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <Dashboard />
      </div>
    </SessionProvider>
  )
}

export default App
