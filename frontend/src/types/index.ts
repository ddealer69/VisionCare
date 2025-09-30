export interface BlinkData {
  timestamp: string
  blinkCount: number
  bpm: number
  earValues: number[]
}

export interface AnalysisResult {
  timestamp: string
  type: 'eye_redness' | 'emotion'
  result: any
}

export interface SessionStats {
  totalBlinks: number
  averageBpm: number
  sessionDuration: number
}

export interface Session {
  sessionId: string
  startTime: string
  blinkData: BlinkData[]
  analysisResults: AnalysisResult[]
  stats: SessionStats
}

export interface EyeTrackingData {
  leftEye: number[]
  rightEye: number[]
  ear: number
  isBlinking: boolean
}

export interface BlinkStats {
  totalBlinks: number
  currentBpm: number
  averageBpm: number
  blinkRate: 'low' | 'normal' | 'high'
  lastBlinkTime: number
}

export interface APIResponse<T = any> {
  message?: string
  error?: string
  result?: T
  sessionId?: string
}