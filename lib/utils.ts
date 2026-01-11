import { ALERT_CATEGORY_COLORS } from './constants'

export function getAlertCategoryColor(category: string): string {
  const normalizedCategory = category?.toLowerCase() as keyof typeof ALERT_CATEGORY_COLORS
  return ALERT_CATEGORY_COLORS[normalizedCategory] || ALERT_CATEGORY_COLORS.info
}

/**
 * Speech impediment patterns for speech therapy research
 */
export interface SpeechImpedimentSettings {
  enabled: boolean          // Master toggle for severe impediment mode
}

/**
 * Apply rhotacism: r/R -> w/W
 * Examples: Bryce -> Bwyce, Rocky -> Wocky
 */
function applyRhotacism(text: string): string {
  return text
    .replace(/r/g, 'w')
    .replace(/R/g, 'W')
}

/**
 * Apply sigmatism (palatal): s/z -> sh/zh
 * Examples: sun -> shun, zoo -> zhoo
 */
function applySigmatism(text: string): string {
  return text
    .replace(/s(?=[aeiouAEIOU])/g, 'sh')
    .replace(/S(?=[aeiouAEIOU])/g, 'Sh')
    .replace(/z(?=[aeiouAEIOU])/g, 'zh')
    .replace(/Z(?=[aeiouAEIOU])/g, 'Zh')
}

/**
 * Apply fronting: k/g -> t/d
 * Examples: cat -> tat, goat -> doat
 */
function applyFronting(text: string): string {
  return text
    .replace(/k/g, 't')
    .replace(/K/g, 'T')
    .replace(/g/g, 'd')
    .replace(/G/g, 'D')
}

/**
 * Apply stopping: f/v -> p/b, th -> t/d
 * Examples: fun -> pun, van -> ban, think -> tink
 */
function applyStopping(text: string): string {
  return text
    .replace(/f/g, 'p')
    .replace(/F/g, 'P')
    .replace(/v/g, 'b')
    .replace(/V/g, 'B')
    .replace(/th/g, 't')
    .replace(/Th/g, 'T')
    .replace(/TH/g, 'T')
}

/**
 * Apply cluster reduction: remove first consonant in consonant clusters
 * Examples: string -> ting, place -> pace
 */
function applyClusterReduction(text: string): string {
  // Pattern: consonant followed by consonant + vowel
  // Common clusters: str, spr, scr, pl, pr, bl, br, cl, cr, dr, fl, fr, gl, gr, tr, tw
  return text
    .replace(/str/gi, (match) => match[0].toLowerCase() === 's' ? 't' : 'T')
    .replace(/spr/gi, (match) => match[0].toLowerCase() === 's' ? 'p' : 'P')
    .replace(/scr/gi, (match) => match[0].toLowerCase() === 's' ? 'c' : 'C')
    .replace(/pl/gi, (match) => match[0].toLowerCase() === 'p' ? 'l' : 'L')
    .replace(/pr/gi, (match) => match[0].toLowerCase() === 'p' ? 'r' : 'R')
    .replace(/bl/gi, (match) => match[0].toLowerCase() === 'b' ? 'l' : 'L')
    .replace(/br/gi, (match) => match[0].toLowerCase() === 'b' ? 'r' : 'R')
    .replace(/cl/gi, (match) => match[0].toLowerCase() === 'c' ? 'l' : 'L')
    .replace(/cr/gi, (match) => match[0].toLowerCase() === 'c' ? 'r' : 'R')
    .replace(/dr/gi, (match) => match[0].toLowerCase() === 'd' ? 'r' : 'R')
    .replace(/fl/gi, (match) => match[0].toLowerCase() === 'f' ? 'l' : 'L')
    .replace(/fr/gi, (match) => match[0].toLowerCase() === 'f' ? 'r' : 'R')
    .replace(/gl/gi, (match) => match[0].toLowerCase() === 'g' ? 'l' : 'L')
    .replace(/gr/gi, (match) => match[0].toLowerCase() === 'g' ? 'r' : 'R')
    .replace(/tr/gi, (match) => match[0].toLowerCase() === 't' ? 'r' : 'R')
    .replace(/tw/gi, (match) => match[0].toLowerCase() === 't' ? 'w' : 'W')
}

/**
 * Apply vocalization: l -> w (especially at end of words)
 * Examples: ball -> baw, little -> littew
 */
function applyVocalization(text: string): string {
  return text
    .replace(/l/g, 'w')
    .replace(/L/g, 'W')
}

/**
 * Apply severe speech impediment mode (all patterns combined)
 * Used for speech therapy research on phonetic-based solutions
 */
export function applySpeechImpedimentMode(
  text: string,
  settings: SpeechImpedimentSettings
): string {
  if (!settings.enabled) {
    return text
  }

  let result = text

  // Apply all patterns in severe mode
  result = applyRhotacism(result)
  result = applySigmatism(result)
  result = applyStopping(result)
  result = applyClusterReduction(result)
  result = applyVocalization(result)

  return result
}
