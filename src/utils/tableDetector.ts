/** Returns the most frequently occurring number in a list of counts. */
function mostFrequent(values: number[]): number {
  const frequency = new Map<number, number>()
  for (const v of values) frequency.set(v, (frequency.get(v) ?? 0) + 1)

  let best = values[0] ?? 0
  let bestCount = 0
  for (const [value, count] of frequency) {
    if (count > bestCount) {
      best = value
      bestCount = count
    }
  }
  return best
}

/**
 * Detects pasted Excel/TSV clipboard content as opposed to normal prose.
 * Deliberately conservative: a document with a single stray tab should NOT
 * be treated as a table. When the signal is ambiguous, this returns false so
 * the original text is preserved and analyzed as prose rather than forcing a
 * table interpretation onto it.
 */
export function detectTableInput(rawText: string): boolean {
  const lines = rawText.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length < 2) return false

  const columnCounts = lines.map((l) => l.split('\t').length)

  const linesWithMultipleColumns = columnCounts.filter((c) => c >= 2).length
  if (linesWithMultipleColumns / lines.length < 0.8) return false

  const mode = mostFrequent(columnCounts)
  if (mode < 2) return false

  const linesMatchingMode = columnCounts.filter((c) => c === mode).length
  return linesMatchingMode / lines.length >= 0.6
}
