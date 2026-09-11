import { describe, expect, it } from 'vitest'
import { parseTsvGrid } from './tsvParser'

describe('parseTsvGrid', () => {
  it('preserves every row including the first (no header slicing) and never forward-fills an empty cell', () => {
    const text = '제품명\t조건\t설명\nKKK\t얇음\tA\n\t두꺼움\tB\n\t정상\tC'
    const table = parseTsvGrid(text)

    expect(table.rowCount).toBe(4)
    // Row 0 is preserved as an ordinary row — not removed as a "header".
    expect(table.rows[0].map((c) => c.value)).toEqual(['제품명', '조건', '설명'])
    expect(table.rows[1][0]).toMatchObject({ value: 'KKK', state: 'value' })

    // Rows 2 and 3: 제품명 cell must stay empty — never auto-filled with "KKK".
    expect(table.rows[2][0].value).toBe('')
    expect(table.rows[2][0].state).toBe('structurally-uncertain')
    expect(table.rows[2][0].possibleContext).toBe('KKK')
    expect(table.rows[3][0].value).toBe('')
    expect(table.rows[3][0].state).toBe('structurally-uncertain')
    expect(table.rows[3][0].possibleContext).toBe('KKK')

    // 조건/설명 columns are fully populated — never marked uncertain.
    expect(table.rows[2][1]).toMatchObject({ value: '두꺼움', state: 'value' })
    expect(table.rows[3][2]).toMatchObject({ value: 'C', state: 'value' })

    // No spanning-gap pattern in the first rows — not flagged as a possible multi-level header.
    expect(table.possibleHeaderRowIndices).toEqual([])
  })

  it('preserves repeated column headers without collapsing them', () => {
    const text = '상위 분류\t상위 분류\t조건\n공정 조건 및 판단 기준\t공정 조건 및 판단 기준\t얇음'
    const table = parseTsvGrid(text)

    expect(table.columnCount).toBe(3)
    expect(table.rows[0].map((c) => c.value)).toEqual(['상위 분류', '상위 분류', '조건'])
    expect(table.rows[1].map((c) => c.value)).toEqual(['공정 조건 및 판단 기준', '공정 조건 및 판단 기준', '얇음'])
  })

  it('tracks structural uncertainty independently per column for hierarchical data', () => {
    const text = [
      '대분류\t중분류\t세부 조건',
      'Photo\tPR\t얇음',
      '\t\t두꺼움',
      '\tHard Mask\t박리',
      'Etch\tMain\tCD 증가',
      '\t\tCD 감소',
    ].join('\n')
    const table = parseTsvGrid(text)

    expect(table.rows[2][0]).toMatchObject({ value: '', state: 'structurally-uncertain', possibleContext: 'Photo' })
    expect(table.rows[3][0]).toMatchObject({ value: '', state: 'structurally-uncertain', possibleContext: 'Photo' })

    expect(table.rows[2][1]).toMatchObject({ value: '', state: 'structurally-uncertain', possibleContext: 'PR' })
    expect(table.rows[3][1]).toMatchObject({ value: 'Hard Mask', state: 'value' })

    expect(table.rows[5][0]).toMatchObject({ value: '', state: 'structurally-uncertain', possibleContext: 'Etch' })
    expect(table.rows[5][1]).toMatchObject({ value: '', state: 'structurally-uncertain', possibleContext: 'Main' })
  })

  it('marks a column with no value anywhere (not even a header label) as plain "empty", never uncertain', () => {
    const text = '제품명\t조건\t설명\t\nKKK\t얇음\tA\t\n\t두꺼움\tB\t'
    const table = parseTsvGrid(text)

    const emptyCol = table.rows.map((row) => row[3])
    expect(emptyCol.every((c) => c.state === 'empty')).toBe(true)
    expect(emptyCol.every((c) => c.possibleContext === undefined)).toBe(true)
  })

  it('parses a normal table with no merge-like structure with zero uncertain cells', () => {
    const text = '제품명\t조건\t설명\nAAA\t얇음\tA\nBBB\t두꺼움\tB'
    const table = parseTsvGrid(text)

    const uncertainCells = table.rows.flat().filter((c) => c.state === 'structurally-uncertain')
    expect(uncertainCells).toHaveLength(0)
  })

  it('keeps a long prose sentence inside a single cell fully intact', () => {
    const sentence = '문제 발생 시 기존 조건으로 진행하거나 담당자에게 문의한다.'
    const text = `조건\t설명\n이상\t${sentence}`
    const table = parseTsvGrid(text)

    expect(table.rows[1][1].value).toBe(sentence)
  })

  it('flags a hierarchical/merge-like empty column corroborated by a fully populated column to its right (false-positive fix, case 1)', () => {
    const text = '제품\t공정\t조건\nKKK\tPR\t얇음\n\tPR\t두꺼움\n\tPR\t정상'
    const table = parseTsvGrid(text)

    expect(table.rows[2][0]).toMatchObject({ state: 'structurally-uncertain', possibleContext: 'KKK' })
    expect(table.rows[3][0]).toMatchObject({ state: 'structurally-uncertain', possibleContext: 'KKK' })
  })

  it('does NOT flag a sparse trailing 비고 (remarks) column, even though a prior value exists above it (false-positive fix, case 2)', () => {
    const text = [
      '제품\t공정\t조건\t비고',
      'KKK\tPR\t얇음\t확인 필요',
      'LLL\tPR\t두꺼움\t',
      'MMM\tPR\t정상\t',
      'NNN\tPR\t얇음\t',
    ].join('\n')
    const table = parseTsvGrid(text)

    const remarksCells = table.rows.map((row) => row[3])
    expect(remarksCells.every((c) => c.state !== 'structurally-uncertain')).toBe(true)
    expect(remarksCells[2]).toMatchObject({ value: '', state: 'empty' })
    expect(remarksCells[3]).toMatchObject({ value: '', state: 'empty' })
    expect(remarksCells[4]).toMatchObject({ value: '', state: 'empty' })
  })

  it('mixed case: 구분/제품 may be flagged, but 비고 stays ordinary empty unless corroborated (false-positive fix, case 3)', () => {
    const text = [
      '구분\t제품\t공정\t조건\t비고',
      'A\tKKK\tPR\t얇음\t확인 필요',
      '\t\tPR\t두꺼움\t',
      '\t\tPR\t정상\t',
      'B\tLLL\tPR\t얇음\t',
    ].join('\n')
    const table = parseTsvGrid(text)

    expect(table.rows[2][0]).toMatchObject({ state: 'structurally-uncertain', possibleContext: 'A' })
    expect(table.rows[3][0]).toMatchObject({ state: 'structurally-uncertain', possibleContext: 'A' })
    expect(table.rows[2][1]).toMatchObject({ state: 'structurally-uncertain', possibleContext: 'KKK' })
    expect(table.rows[3][1]).toMatchObject({ state: 'structurally-uncertain', possibleContext: 'KKK' })

    const remarksCells = table.rows.map((row) => row[4])
    expect(remarksCells.every((c) => c.state !== 'structurally-uncertain')).toBe(true)
  })

  it('produces no structurally-uncertain cells for a fully normal table with only optional blanks (false-positive fix, case 4)', () => {
    const text = ['이름\t부서\t비고', '철수\t개발\t확인 필요', '영희\t기획\t', '민수\t영업\t'].join('\n')
    const table = parseTsvGrid(text)

    const uncertainCells = table.rows.flat().filter((c) => c.state === 'structurally-uncertain')
    expect(uncertainCells).toHaveLength(0)
  })

  describe('multi-level / merged-style headers (no destructive header slicing)', () => {
    it('preserves a two-level column-group header without inventing values for the spanned blank cells', () => {
      const text = [
        '정상 조건\t\t\t이상 조건\t\t',
        '두께\t온도\t시간\t두께\t온도\t시간',
        '100~200nm\t90~95℃\t60~70s\t<100nm\t>95℃\t>70s',
      ].join('\n')
      const table = parseTsvGrid(text)

      expect(table.rowCount).toBe(3)
      // The blanks next to "정상 조건"/"이상 조건" must stay blank — never rewritten to repeat the group label.
      expect(table.rows[0].map((c) => c.value)).toEqual(['정상 조건', '', '', '이상 조건', '', ''])
      expect(table.rows[1].map((c) => c.value)).toEqual(['두께', '온도', '시간', '두께', '온도', '시간'])
      expect(table.rows[2].map((c) => c.value)).toEqual(['100~200nm', '90~95℃', '60~70s', '<100nm', '>95℃', '>70s'])

      // Row 0 has the "값, gap, 값, gap" spanning signature — a soft multi-level-header hint.
      expect(table.possibleHeaderRowIndices).toContain(0)
    })

    it('preserves a first-column parent context above a two-level header, without auto-filling the lower cells (Test 7)', () => {
      const text = [
        'KKK\t정상 조건\t\t\t이상 조건\t\t',
        '\t두께\t온도\t시간\t두께\t온도\t시간',
        '\t100~200nm\t90~95℃\t60~70s\t<100nm\t>95℃\t>70s',
      ].join('\n')
      const table = parseTsvGrid(text)

      expect(table.rowCount).toBe(3)
      // "KKK" must remain only in its original cell — never propagated downward.
      expect(table.rows[0][0]).toMatchObject({ value: 'KKK', state: 'value' })
      expect(table.rows[1][0].value).toBe('')
      expect(table.rows[2][0].value).toBe('')
      expect(table.rows[1][0].value).not.toBe('KKK')
      expect(table.rows[2][0].value).not.toBe('KKK')

      // Column 1 (두께/온도 group label) is fully populated once you look right — corroborated.
      expect(table.rows[1][0]).toMatchObject({ state: 'structurally-uncertain', possibleContext: 'KKK' })
      expect(table.rows[2][0]).toMatchObject({ state: 'structurally-uncertain', possibleContext: 'KKK' })

      expect(table.possibleHeaderRowIndices).toContain(0)
    })
  })
})
