import { describe, expect, it } from 'vitest'
import { parseDocument } from './textParser'
import { SAMPLE_DOCUMENT } from '../sample/sampleDocument'

describe('parseDocument', () => {
  it('still parses the existing PR-process prose sample as prose, unaffected by the table path', () => {
    const doc = parseDocument(SAMPLE_DOCUMENT)
    expect(doc.inputType).toBe('prose')
    expect(doc.table).toBeNull()
    expect(doc.sentences.length).toBeGreaterThan(0)
    expect(doc.sentences.some((s) => s.includes('기존 조건'))).toBe(true)
  })

  it('routes Excel-clipboard TSV to the table path instead of the prose splitter', () => {
    const text = '제품명\t조건\t설명\nKKK\t얇음\tA\n\t두꺼움\tB\n\t정상\tC'
    const doc = parseDocument(text)
    expect(doc.inputType).toBe('table')
    expect(doc.table).not.toBeNull()
    // All 4 pasted rows are preserved — the first row is no longer sliced off as a header.
    expect(doc.table?.rowCount).toBe(4)
  })

  it('never lets the empty first cell of a merge-like row silently become "KKK" (regression for the bug report)', () => {
    const text = '제품명\t조건\t설명\nKKK\t얇음\tA\n\t두꺼움\tB'
    const doc = parseDocument(text)
    // Row 0 = header line, row 1 = "KKK" row, row 2 = the empty-first-cell row.
    expect(doc.table?.rows[2][0].value).toBe('')
    expect(doc.table?.rows[2][0].value).not.toBe('KKK')
  })

  it('does not fragment a table cell on the old prose sentence-splitting boundary (spec case H)', () => {
    const sentence = '문제 발생 시 기존 조건으로 진행하거나 담당자에게 문의한다.'
    // Previously, a tab right after a syllable like "얇음" was misread as a
    // sentence boundary by the prose splitter. Reproduce that exact shape
    // inside a detected table and confirm the cell stays whole.
    const text = `조건\t설명\n얇음\t${sentence}`
    const doc = parseDocument(text)
    expect(doc.inputType).toBe('table')
    // The full cell must appear as exactly one atomic entry — not split into
    // fragments the way the old prose splitter would have cut it at a tab.
    expect(doc.sentences.filter((s) => s === sentence)).toHaveLength(1)
    expect(doc.sentences).toEqual(['조건', '설명', '얇음', sentence])
  })

  it('produces zero table-derived sentences fragments for a clean table (spec case G)', () => {
    const text = '제품명\t조건\t설명\nAAA\t얇음\tA\nBBB\t두꺼움\tB'
    const doc = parseDocument(text)
    expect(doc.sentences).toEqual(['제품명', '조건', '설명', 'AAA', '얇음', 'A', 'BBB', '두꺼움', 'B'])
  })
})
