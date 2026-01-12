import { ALERT_CATEGORY_COLORS } from './constants'

export function getAlertCategoryColor(category: string): string {
  const normalizedCategory = category?.toLowerCase() as keyof typeof ALERT_CATEGORY_COLORS
  return ALERT_CATEGORY_COLORS[normalizedCategory] || ALERT_CATEGORY_COLORS.info
}
