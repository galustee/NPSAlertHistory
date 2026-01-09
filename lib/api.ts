import { API_ENDPOINTS, ERROR_MESSAGES } from './constants'

export class APIError extends Error {
  constructor(
    public message: string,
    public status?: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export interface Park {
  id: string
  park_code: string
  name: string
  designation?: string
  created_at: string
}

export interface Alert {
  id: string
  nps_alert_id: string
  title: string
  description: string
  category: string
  url: string
  last_updated_by_nps: string
  fetched_at: string
}

export interface HistoryVersion {
  id: string
  title: string
  description: string
  last_updated_by_nps: string
  fetched_at: string
}

export interface ParkData {
  park: {
    id: string
    park_code: string
    name: string
  }
  currentAlerts: Alert[]
}

export interface AlertHistoryResponse {
  alertId: string
  history: HistoryVersion[]
}

class APIClient {
  private baseURL = ''

  async fetchParks(): Promise<Park[]> {
    const response = await this.request(API_ENDPOINTS.PARKS)
    return response as Park[]
  }

  async fetchParkAlerts(code: string): Promise<ParkData> {
    const response = await this.request(API_ENDPOINTS.PARK_ALERTS(code))
    return response as ParkData
  }

  async fetchAlertHistory(code: string, alertId: string): Promise<AlertHistoryResponse> {
    const response = await this.request(API_ENDPOINTS.ALERT_HISTORY(code, alertId))
    return response as AlertHistoryResponse
  }

  private async request<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        const errorMessage = this.getErrorMessage(response.status)
        throw new APIError(errorMessage, response.status)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }

      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR
      throw new APIError(message)
    }
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 404:
        return ERROR_MESSAGES.PARK_NOT_FOUND
      case 500:
        return 'Server error. Please try again later.'
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR
    }
  }
}

export const apiClient = new APIClient()
