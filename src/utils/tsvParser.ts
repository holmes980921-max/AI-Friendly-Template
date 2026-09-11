import type { TableCell, TableGrid } from '../types/document'

/** Header names that conventionally hold optional/free-text remarks rather than a hierarchy/grouping label. */
const DESCRIPTIVE_FIELD_HEADERS = new Set([
  '비고',
  '참고',
  '설명',
  '메모',
  '주석',
  '코멘트',
  '기타',
  'comment',
  'comments',
  'remark',
  'remarks',
  'note',
  'notes',
  'memo',
])

function isDescriptiveFieldHeader(cellValue: string): boolean {
  return DESCRIPTIVE_FIELD_HEADERS.has(cellValue.trim().toLowerCase())
}

/**
 * A row "looks like" a header/group-label row when it has at least one
 * empty cell AND its non-empty cells form 2 or more separate runs (i.e. a
 * value, then a gap, then another value) — the visual signature of a label
 * spanning several columns underneath it. This is only ever used to surface
 * a soft UI hint; it never removes the row from the grid or changes how its
 * cells are classified.
 */
function hasGroupSpanningPattern(row: string[]): boolean {
  if (!row.some((cell) => cell === '')) return false

  let runs = 0
  let inRun = false
  for (const cell of row) {
    if (cell !== '') {
      if (!inRun) runs += 1
      inRun = true
    } else {
      inRun = false
    }
  }
  return runs >= 2
}

/** Checks only the first couple of rows — multi-level headers, when present, sit at the top of the pasted range. */
function detectPossibleHeaderRowIndices(grid: string[][]): number[] {
  const indices: number[] = []
  for (let r = 0; r < Math.min(2, grid.length); r++) {
    if (hasGroupSpanningPattern(grid[r])) indices.push(r)
  }
  return indices
}

/**
 * Parses pasted Excel/TSV clipboard text into a raw grid, preserving every
 * row and cell position exactly as the clipboard gave it. Critically, this:
 *
 *  - does NOT `.trim()` whole lines (which would silently delete a leading/
 *    trailing empty cell caused by a merged cell in the original spreadsheet)
 *  - does NOT forward-fill empty cells with a value from a previous row
 *  - does NOT assume the first row is a header and slice it off — a table
 *    with a multi-level/merged-style header (a group-label row followed by a
 *    leaf-label row) needs its top rows to remain ordinary grid rows so that
 *    a first-column value like "KKK" spanning several rows underneath it can
 *    still be recognized as a possible parent context. Header-likeness is
 *    only ever surfaced as `possibleHeaderRowIndices`, a non-destructive hint.
 *
 * Each empty cell is classified as either:
 *  - 'empty': an ordinary blank cell, or
 *  - 'structurally-uncertain': a blank cell that follows a non-empty value in
 *    the same column AND is corroborated by at least one column further to
 *    the right being fully populated across that same run of rows — the
 *    structural shape a merged "parent label" column takes once flattened
 *    to TSV. Without that corroboration — e.g. a column that is simply
 *    sparse, or a trailing optional/remarks column with nothing to its
 *    right — the cell stays 'empty'. This is deliberately conservative:
 *    clipboard TSV never tells us whether a cell was actually merged, so we
 *    only raise the possibility when there is real structural evidence, and
 *    default to plain "empty" otherwise rather than manufacturing noise.
 */
export function parseTsvGrid(rawText: string): TableGrid {
  const rawLines = rawText.split(/\r?\n/).filter((l) => l.length > 0)

  // Split on the tab delimiter only — do not trim the raw line first, or a
  // leading/trailing empty cell (tab at the very start/end of the line) is lost.
  const grid = rawLines.map((line) => line.split('\t').map((cell) => cell.trim()))

  const columnCount = grid.reduce((max, row) => Math.max(max, row.length), 0)
  const paddedGrid = grid.map((row) => {
    const padded = [...row]
    while (padded.length < columnCount) padded.push('')
    return padded
  })

  const rowCount = paddedGrid.length
  const isFilled = (row: number, col: number): boolean => (paddedGrid[row]?.[col] ?? '') !== ''

  /**
   * A blank run is only "corroborated" when some column to its right has a
   * real value on every row of that exact run — i.e. those rows are genuine,
   * distinct sub-items, not simply incomplete data.
   */
  function hasCorroboratingRightColumn(col: number, rowStart: number, rowEnd: number): boolean {
    for (let otherCol = col + 1; otherCol < columnCount; otherCol++) {
      let allFilled = true
      for (let r = rowStart; r <= rowEnd; r++) {
        if (!isFilled(r, otherCol)) {
          allFilled = false
          break
        }
      }
      if (allFilled) return true
    }
    return false
  }

  const rows: TableCell[][] = paddedGrid.map(() => [])

  for (let col = 0; col < columnCount; col++) {
    // A descriptive/optional-field label anywhere in this column (almost
    // always its header cell) suppresses corroboration for the whole column,
    // regardless of which row that label happens to sit in.
    const columnHasDescriptiveLabel = paddedGrid.some((row) => isDescriptiveFieldHeader(row[col]))

    let lastNonEmptyValue: string | undefined
    let runStart: number | null = null

    const flushRun = (runEnd: number) => {
      if (runStart === null || lastNonEmptyValue === undefined) return
      const corroborated = !columnHasDescriptiveLabel && hasCorroboratingRightColumn(col, runStart, runEnd)
      for (let r = runStart; r <= runEnd; r++) {
        rows[r][col] = corroborated
          ? { row: r, col, value: '', state: 'structurally-uncertain', possibleContext: lastNonEmptyValue }
          : { row: r, col, value: '', state: 'empty' }
      }
      runStart = null
    }

    for (let row = 0; row < rowCount; row++) {
      const value = paddedGrid[row][col]
      if (value !== '') {
        flushRun(row - 1)
        lastNonEmptyValue = value
        rows[row][col] = { row, col, value, state: 'value' }
      } else if (lastNonEmptyValue === undefined) {
        rows[row][col] = { row, col, value: '', state: 'empty' }
      } else if (runStart === null) {
        runStart = row
      }
    }
    flushRun(rowCount - 1)
  }

  return { rows, columnCount, rowCount, possibleHeaderRowIndices: detectPossibleHeaderRowIndices(paddedGrid) }
}
