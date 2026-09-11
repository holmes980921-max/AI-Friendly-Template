export type CellState = 'value' | 'empty' | 'structurally-uncertain'

export interface TableCell {
  row: number
  col: number
  value: string
  state: CellState
  /**
   * Only set when state is 'structurally-uncertain': a non-empty value seen
   * earlier in the same column. This is a POSSIBILITY surfaced for review,
   * never a confirmed value — it must never be written back into `value`.
   */
  possibleContext?: string
}

export interface TableGrid {
  /**
   * Every pasted row, in original top-to-bottom order. No row is removed or
   * assumed to be a header — parsing is lossless; header-likeness is only
   * ever a soft interpretive hint (see `possibleHeaderRowIndices`), never a
   * destructive step.
   */
  rows: TableCell[][]
  columnCount: number
  rowCount: number
  /**
   * 0-based indices into `rows` that structurally look like they may form a
   * header / column-group-label block (e.g. a row with two or more separate
   * non-empty spans divided by empty gaps, suggesting spanning group
   * labels). This is a heuristic hint for display purposes only — it is
   * never used to remove, relabel, or reclassify any row's cells.
   */
  possibleHeaderRowIndices: number[]
}

export type InputType = 'prose' | 'table'

export interface ParsedDocument {
  rawText: string
  inputType: InputType
  /** Present only when inputType is 'table'. */
  table: TableGrid | null
  /** Blank-line-separated blocks (prose) or one entry per row (table), trimmed. */
  paragraphs: string[]
  /** Non-empty lines (prose) or one entry per row (table), trimmed. */
  lines: string[]
  /** Sentence-level units (prose) or one entry per populated cell (table), in order. */
  sentences: string[]
  charCount: number
  paragraphCount: number
  lineCount: number
  sentenceCount: number
}
