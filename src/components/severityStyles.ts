import type { Severity } from '../types/diagnostic'

export const SEVERITY_BADGE_CLASSES: Record<Severity, string> = {
  high: 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  medium:
    'bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  low: 'bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
  info: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
}

export const SEVERITY_CARD_ACCENT: Record<Severity, string> = {
  high: 'border-l-4 border-l-red-500',
  medium: 'border-l-4 border-l-orange-500',
  low: 'border-l-4 border-l-yellow-400',
  info: 'border-l-4 border-l-sky-400',
}

/** Category icon based on the most severe finding present — a heuristic visual cue, not a score. */
export function categoryIcon(counts: { high: number; medium: number; low: number; info: number }): string {
  if (counts.high > 0) return '\u{1F534}'
  if (counts.medium > 0) return '\u{1F7E0}'
  if (counts.low > 0) return '\u{1F7E1}'
  if (counts.info > 0) return '\u{1F535}'
  return '✅'
}
