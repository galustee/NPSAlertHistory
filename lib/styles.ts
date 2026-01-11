/**
 * Layout and Container Styles
 */
export const layoutStyles = {
  nav: 'border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm',
  container: 'max-w-6xl mx-auto px-6',
  bgGradient: 'bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900',
} as const;

/**
 * Card Styles
 */
export const cardStyles = {
  base: 'bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700',
  interactive: 'bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow',
  hover: 'hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-300',
} as const;

/**
 * Color Palettes
 */
export const alertCategoryColors = {
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
  closure: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
  caution: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  information: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
} as const;

export const feedCategoryColors: Record<string, string> = {
  'Danger': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Caution': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Information': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Park Closure': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
} as const;

/**
 * Feed Timeline Styles
 */
export const feedTimelineStyles = {
  dateHeader: 'sticky top-16 z-10 mb-6 pt-4',
  dateHeaderContent: 'bg-gradient-to-r from-blue-50 to-transparent dark:from-slate-800/50 dark:to-transparent rounded-lg border border-blue-200 dark:border-slate-700 px-4 py-3 backdrop-blur-sm',
  verticalLine: 'absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-slate-600',
  dotActive: 'bg-green-500',
  dotInactive: 'bg-gray-400',
  dotBase: 'absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-slate-600 flex items-center justify-center -translate-x-0.5',
  cardContainer: 'relative pl-12',
  alertItemContainer: 'space-y-6',
} as const;

/**
 * Status Indicators
 */
export const statusColors = {
  active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700',
} as const;
