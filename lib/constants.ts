// Re-export styles from dedicated styles file
export { layoutStyles, cardStyles, alertCategoryColors, feedCategoryColors, feedTimelineStyles, statusColors } from './styles'

// Backward compatibility - map old names to new exports
import { layoutStyles, cardStyles, alertCategoryColors, feedCategoryColors, feedTimelineStyles, statusColors } from './styles'

export const CONTAINER_STYLES = {
  maxWidth: 'max-w-6xl',
  padding: 'px-6',
  centered: layoutStyles.container,
} as const

export const CARD_STYLES = cardStyles
export const NAV_STYLES = { base: layoutStyles.nav }
export const ALERT_CATEGORY_COLORS = alertCategoryColors
export const STATUS_COLORS = statusColors
export const FEED_CATEGORY_COLORS = feedCategoryColors
export const FEED_TIMELINE_STYLES = feedTimelineStyles
export const BG_GRADIENT = layoutStyles.bgGradient

// API Endpoints
export const API_ENDPOINTS = {
  PARKS: '/api/parks',
  PARK_ALERTS: (code: string) => `/api/parks/${code}/alerts`,
  ALERT_HISTORY: (code: string, alertId: string) => `/api/parks/${code}/history?alertId=${alertId}`,
  NPS_CONDITIONS: (code: string) => `https://www.nps.gov/${code}/planyourvisit/conditions.htm`,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  PARK_NOT_FOUND: 'Park not found',
  FAILED_TO_FETCH_PARKS: 'Failed to fetch parks',
  FAILED_TO_FETCH_ALERTS: 'Failed to fetch alerts',
  FAILED_TO_FETCH_HISTORY: 'Failed to fetch alert history',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const
