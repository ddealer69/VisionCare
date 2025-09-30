import { useEffect, useRef, useState } from 'react'
import { useBlinkDetection } from '../hooks/useBlinkDetection'
import { useSession } from '../contexts/SessionContext'

const WebcamFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { isSessionActive } = useSession()
  const blinkDetection = useBlinkDetection(videoRef, canvasRef)
  const { 
    isDetecting, 
    blinkStats, 
    startDetection, 
    stopDetection 
  } = blinkDetection

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        })
        
        setStream(mediaStream)
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          await videoRef.current.play()
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('Error accessing camera:', err)
        setError('Failed to access camera. Please ensure camera permissions are granted.')
        setIsLoading(false)
      }
    }

    initializeCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (isSessionActive && !isDetecting && !isLoading && !error) {
      startDetection()
    } else if (!isSessionActive && isDetecting) {
      stopDetection()
    }
  }, [isSessionActive, isDetecting, isLoading, error, startDetection, stopDetection])

  const getBlinkRateColor = (rate: string) => {
    switch (rate) {
      case 'low': return 'text-blue-300'
      case 'high': return 'text-yellow-300'
      default: return 'text-green-300'
    }
  }

  const getBlinkRateMessage = (rate: string) => {
    switch (rate) {
      case 'low': return 'Blink rate is low - try to blink more frequently'
      case 'high': return 'Blink rate is high - you might be tired or stressed'
      default: return 'Blink rate is normal'
    }
  }

  if (error) {
    return (
      <div className="relative w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <p className="text-red-300 text-lg mb-2">Camera Error</p>
          <p className="text-gray-300 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-96">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        autoPlay
        playsInline
        muted
      />

      {/* Canvas for OpenCV processing (hidden) */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={640}
        height={480}
      />

      {/* Overlay with blink detection info */}
      {isDetecting && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">Tracking Active</span>
          </div>
        </div>
      )}

      {/* Blink statistics overlay */}
      {blinkStats && (
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <div className="text-white text-sm space-y-1">
            <div>Blinks: <span className="font-semibold">{blinkStats.totalBlinks}</span></div>
            <div>BPM: <span className="font-semibold">{blinkStats.currentBpm.toFixed(1)}</span></div>
            <div className={`${getBlinkRateColor(blinkStats.blinkRate)} text-xs`}>
              {getBlinkRateMessage(blinkStats.blinkRate)}
            </div>
          </div>
        </div>
      )}

      {/* Session status overlay */}
      {!isSessionActive && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-300 text-lg mb-2">Session Inactive</div>
            <p className="text-gray-400 text-sm">Start a session to begin eye tracking</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WebcamFeed