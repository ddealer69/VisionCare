import { useState, useCallback, useRef, useEffect } from 'react'
import type { BlinkStats, EyeTrackingData } from '../types'
import { useSession } from '../contexts/SessionContext'

declare global {
  interface Window {
    cv: any
  }
}

export const useBlinkDetection = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const [isDetecting, setIsDetecting] = useState(false)
  const [blinkStats, setBlinkStats] = useState<BlinkStats>({
    totalBlinks: 0,
    currentBpm: 0,
    averageBpm: 0,
    blinkRate: 'normal',
    lastBlinkTime: 0
  })
  const [isOpenCVReady, setIsOpenCVReady] = useState(false)

  const { logBlinkData, isSessionActive } = useSession()
  
  const detectionIntervalRef = useRef<number | null>(null)
  const blinkHistoryRef = useRef<number[]>([])
  const earHistoryRef = useRef<number[]>([])
  const lastBlinkRef = useRef<number>(0)
  const blinkCountRef = useRef<number>(0)

  // Load OpenCV.js
  useEffect(() => {
    const loadOpenCV = () => {
      if (window.cv && window.cv.Mat) {
        setIsOpenCVReady(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://docs.opencv.org/4.8.0/opencv.js'
      script.onload = () => {
        // Wait for OpenCV to be ready
        const checkOpenCV = () => {
          if (window.cv && window.cv.Mat) {
            setIsOpenCVReady(true)
          } else {
            setTimeout(checkOpenCV, 100)
          }
        }
        checkOpenCV()
      }
      script.onerror = () => {
        console.error('Failed to load OpenCV.js')
      }
      document.head.appendChild(script)
    }

    loadOpenCV()
  }, [])

  // Calculate Eye Aspect Ratio (EAR) - reserved for future use
  /* const calculateEAR = useCallback((eyePoints: number[][]): number => {
    if (eyePoints.length < 6) return 0

    // Vertical distances
    const v1 = Math.sqrt(
      Math.pow(eyePoints[1][0] - eyePoints[5][0], 2) + 
      Math.pow(eyePoints[1][1] - eyePoints[5][1], 2)
    )
    const v2 = Math.sqrt(
      Math.pow(eyePoints[2][0] - eyePoints[4][0], 2) + 
      Math.pow(eyePoints[2][1] - eyePoints[4][1], 2)
    )

    // Horizontal distance
    const h = Math.sqrt(
      Math.pow(eyePoints[0][0] - eyePoints[3][0], 2) + 
      Math.pow(eyePoints[0][1] - eyePoints[3][1], 2)
    )

    // EAR calculation
    return (v1 + v2) / (2.0 * h)
  }, []) */

  // Mock eye detection (since full OpenCV face detection is complex)
  // In a real implementation, you would use cv.CascadeClassifier for face detection
  // and dlib or MediaPipe for facial landmark detection
  const detectEyes = useCallback((): EyeTrackingData | null => {
    if (!videoRef.current || !canvasRef.current || !isOpenCVReady) {
      return null
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // For demo purposes, simulate eye tracking data
      // In a real implementation, this would use OpenCV for actual face/eye detection
      const mockEyeData: EyeTrackingData = {
        leftEye: [100, 150, 120, 140, 140, 160, 130, 170, 110, 160, 90, 150],
        rightEye: [200, 150, 220, 140, 240, 160, 230, 170, 210, 160, 190, 150],
        ear: 0.2 + Math.random() * 0.1, // Simulate EAR between 0.2-0.3
        isBlinking: false
      }

      // Add some realistic variation to simulate blinking
      const time = Date.now()
      const blinkPattern = Math.sin(time / 3000) // Slower blink pattern
      if (blinkPattern > 0.8) {
        mockEyeData.ear = 0.15 // Lower EAR indicates blinking
        mockEyeData.isBlinking = true
      }

      return mockEyeData
    } catch (error) {
      console.error('Eye detection error:', error)
      return null
    }
  }, [videoRef, canvasRef, isOpenCVReady])

  // Process blink detection
  const processBlinkDetection = useCallback(() => {
    const eyeData = detectEyes()
    if (!eyeData) return

    const currentTime = Date.now()
    const EAR_THRESHOLD = 0.18 // Threshold for blink detection

    // Add EAR to history
    earHistoryRef.current.push(eyeData.ear)
    if (earHistoryRef.current.length > 10) {
      earHistoryRef.current.shift()
    }

    // Detect blink (EAR below threshold)
    if (eyeData.ear < EAR_THRESHOLD && currentTime - lastBlinkRef.current > 200) {
      blinkCountRef.current += 1
      lastBlinkRef.current = currentTime
      
      // Add to blink history for BPM calculation
      blinkHistoryRef.current.push(currentTime)
      if (blinkHistoryRef.current.length > 20) {
        blinkHistoryRef.current.shift()
      }
    }

    // Calculate BPM (blinks per minute)
    let currentBpm = 0
    let averageBpm = 0

    if (blinkHistoryRef.current.length >= 2) {
      const recentBlinks = blinkHistoryRef.current.filter(
        time => currentTime - time < 60000 // Last minute
      )
      currentBpm = recentBlinks.length

      // Calculate average BPM
      if (blinkHistoryRef.current.length > 0) {
        const timeSpan = currentTime - blinkHistoryRef.current[0]
        averageBpm = (blinkHistoryRef.current.length * 60000) / timeSpan
      }
    }

    // Determine blink rate status
    let blinkRate: 'low' | 'normal' | 'high' = 'normal'
    if (currentBpm < 10) blinkRate = 'low'
    else if (currentBpm > 25) blinkRate = 'high'

    const newStats: BlinkStats = {
      totalBlinks: blinkCountRef.current,
      currentBpm,
      averageBpm,
      blinkRate,
      lastBlinkTime: lastBlinkRef.current
    }

    setBlinkStats(newStats)

    // Log data if session is active
    if (isSessionActive) {
      logBlinkData({
        blinkCount: blinkCountRef.current,
        bpm: currentBpm,
        earValues: [...earHistoryRef.current]
      })
    }
  }, [detectEyes, logBlinkData, isSessionActive])

  const startDetection = useCallback(() => {
    if (!isOpenCVReady || isDetecting) return

    setIsDetecting(true)
    
    // Reset counters
    blinkCountRef.current = 0
    blinkHistoryRef.current = []
    earHistoryRef.current = []
    lastBlinkRef.current = 0

    // Start detection loop
    detectionIntervalRef.current = window.setInterval(() => {
      processBlinkDetection()
    }, 100) // 10 FPS detection rate
  }, [isOpenCVReady, isDetecting, processBlinkDetection])

  const stopDetection = useCallback(() => {
    if (!isDetecting) return

    setIsDetecting(false)
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
  }, [isDetecting])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [])

  return {
    isDetecting,
    blinkStats,
    isOpenCVReady,
    startDetection,
    stopDetection
  }
}