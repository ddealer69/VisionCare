import type { BlinkData, APIResponse, Session } from '../types'

const API_BASE_URL = 'http://localhost:5000/api'

class ApiService {
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  async healthCheck(): Promise<APIResponse> {
    return this.request('/health')
  }

  async startSession(): Promise<APIResponse<{ session_id: string }>> {
    return this.request('/session/start', {
      method: 'POST',
    })
  }

  async logBlinkData(data: Omit<BlinkData, 'timestamp'>): Promise<APIResponse> {
    return this.request('/session/log-blink', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async analyzeEyeRedness(imageBlob: Blob): Promise<APIResponse> {
    const formData = new FormData()
    formData.append('image', imageBlob, 'eye-image.jpg')

    return this.request('/analyze/eye-redness', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it with boundary
    })
  }

  async analyzeEmotion(imageBlob: Blob): Promise<APIResponse> {
    const formData = new FormData()
    formData.append('image', imageBlob, 'face-image.jpg')

    return this.request('/analyze/emotion', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it with boundary
    })
  }

  async saveSession(): Promise<APIResponse> {
    return this.request('/session/save', {
      method: 'POST',
    })
  }

  async getSessions(): Promise<APIResponse<{ sessions: Session[] }>> {
    return this.request('/sessions')
  }

  async getSessionDetails(sessionId: string): Promise<APIResponse<Session>> {
    return this.request(`/session/${sessionId}`)
  }
}

export const apiService = new ApiService()