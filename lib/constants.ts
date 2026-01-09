// UI Constants
export const CONTAINER_STYLES = {
  maxWidth: 'max-w-6xl',
  padding: 'px-6',
  centered: 'max-w-6xl mx-auto px-6',
} as const

export const CARD_STYLES = {
  base: 'bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700',
  hover: 'hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-300',
  interactive: 'bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow',
} as const

export const NAV_STYLES = {
  base: 'border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm',
} as const

export const ALERT_CATEGORY_COLORS = {
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
  closure: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
  caution: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  information: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
} as const

export const STATUS_COLORS = {
  active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700',
} as const

export const BG_GRADIENT = 'bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900'

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
