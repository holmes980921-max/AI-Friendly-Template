import type { ParsedDocument, TableGrid } from '../types/document'
import { detectTableInput } from './tableDetector'
import { parseTsvGrid } from './tsvParser'

const BULLET_PREFIX = /^([-*·•]|\(?\d+[.)])\s*/

/** Strips a leading bullet/number marker (-, *, ·, 1., 1), (1)) from a line. */
function stripBulletPrefix(line: string): string {
  return line.replace(BULLET_PREFIX, '')
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
}

/** Splits Korean/mixed text into sentence-like units, one line at a time. */
function splitSentences(lines: string[]): string[] {
  const sentences: string[] = []
  for (const rawLine of lines) {
    const line = stripBulletPrefix(rawLine)
    if (line === '') continue
    const parts = line
      .split(/(?<=[.?!다요함음됨임])\s+(?=[가-힣A-Za-z0-9(])/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length > 0) sentences.push(...parts)
    else sentences.push(line)
  }
  return sentences
}

/**
 * Builds prose-shaped (paragraphs/lines/sentences) views over a parsed table
 * so the existing document-centric rules can scan cell contents uniformly —
 * without ever re-joining cells across a tab (which is what previously
 * caused cell text to be mangled by the prose sentence-splitting regex).
 * Each populated cell becomes exactly one atomic "sentence" and each row
 * becomes exactly one "paragraph"/"line" — table structure itself is never
 * flattened into this view; it stays available via `doc.table`.
 */
function buildTableDerivedText(table: TableGrid): { paragraphs: string[]; lines: string[]; sentences: string[] } {
  const rowTexts: string[] = []
  const sentences: string[] = []

  for (const row of table.rows) {
    const populated = row.filter((cell) => cell.value !== '')
    if (populated.length > 0) rowTexts.push(populated.map((c) => c.value).join(' / '))
    for (const cell of populated) sentences.push(cell.value)
  }

  return { paragraphs: rowTexts, lines: rowTexts, sentences }
}

export function parseDocument(rawText: string): ParsedDocument {
  if (detectTableInput(rawText)) {
    const table = parseTsvGrid(rawText)
    const { paragraphs, lines, sentences } = buildTableDerivedText(table)

    return {
      rawText,
      inputType: 'table',
      table,
      paragraphs,
      lines,
      sentences,
      charCount: rawText.trim().length,
      paragraphCount: paragraphs.length,
      lineCount: lines.length,
      sentenceCount: sentences.length,
    }
  }

  const paragraphs = splitParagraphs(rawText)
  const lines = splitLines(rawText)
  const sentences = splitSentences(lines)

  return {
    rawText,
    inputType: 'prose',
    table: null,
    paragraphs,
    lines,
    sentences,
    charCount: rawText.trim().length,
    paragraphCount: paragraphs.length,
    lineCount: lines.length,
    sentenceCount: sentences.length,
  }
}
