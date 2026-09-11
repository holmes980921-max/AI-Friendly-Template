import { describe, expect, it } from 'vitest'
import { parseDocument } from '../utils/textParser'
import { runTableStructureRules } from './tableStructureRules'
import { runRuleEngine } from './ruleEngine'

describe('runTableStructureRules', () => {
  it('flags each merge-like empty cell without asserting the merge or the value as fact (spec case A/F)', () => {
    const text = '제품명\t조건\t설명\nKKK\t얇음\tA\n\t두꺼움\tB\n\t정상\tC'
    const doc = parseDocument(text)
    const findings = runTableStructureRules(doc)

    expect(findings).toHaveLength(1)
    const [finding] = findings
    expect(finding.category).toBe('scope')
    expect(finding.source).toBe('rule')

    // Must reference both affected rows (absolute row numbers 3 and 4 — row 1 is the header line) grouped together.
    expect(finding.finding).toContain('3, 4')
    expect(finding.finding).toContain('KKK')

    // Must hedge — never assert the merge or invent the missing value as fact.
    expect(finding.finding).toContain('판단하기 어렵습니다')
    expect(finding.finding).not.toContain('병합되었습니다')
    expect(finding.finding).not.toContain('누락되었습니다')
    expect(finding.whatToCheck.join(' ')).not.toContain('제품명이 누락되었습니다')
  })

  it('produces no findings for a table with no merge-like structure (spec case G)', () => {
    const text = '제품명\t조건\t설명\nAAA\t얇음\tA\nBBB\t두꺼움\tB'
    const doc = parseDocument(text)
    expect(runTableStructureRules(doc)).toEqual([])
  })

  it('produces no findings for prose input', () => {
    const doc = parseDocument('PR 두께가 얇으면 문제가 발생할 수 있다.\n문제 발생 시 담당자에게 문의한다.')
    expect(runTableStructureRules(doc)).toEqual([])
  })

  it('tracks two independent uncertain columns for hierarchical data as separate groups (spec case D)', () => {
    const text = [
      '대분류\t중분류\t세부 조건',
      'Photo\tPR\t얇음',
      '\t\t두꺼움',
      '\tHard Mask\t박리',
      'Etch\tMain\tCD 증가',
      '\t\tCD 감소',
    ].join('\n')
    const doc = parseDocument(text)
    const findings = runTableStructureRules(doc)

    // Photo/col0, PR/col1, Etch/col0, Main/col1 — four distinct (column, possibleContext) groups.
    expect(findings).toHaveLength(4)
    const possibleContexts = findings.map((f) => f.finding)
    expect(possibleContexts.some((f) => f.includes('Photo'))).toBe(true)
    expect(possibleContexts.some((f) => f.includes('Etch'))).toBe(true)
  })

  it('does not raise a finding for a sparse trailing 비고 column, only for the corroborated 제품 column (false-positive fix, case 2/3)', () => {
    const text = [
      '구분\t제품\t공정\t조건\t비고',
      'A\tKKK\tPR\t얇음\t확인 필요',
      '\t\tPR\t두꺼움\t',
      '\t\tPR\t정상\t',
      'B\tLLL\tPR\t얇음\t',
    ].join('\n')
    const doc = parseDocument(text)
    const findings = runTableStructureRules(doc)

    const columnsFlagged = findings.map((f) => f.title && f.finding)
    expect(findings.some((f) => f.finding.includes('구분'))).toBe(true)
    expect(findings.some((f) => f.finding.includes('제품'))).toBe(true)
    expect(findings.some((f) => f.finding.includes('비고'))).toBe(false)
    expect(columnsFlagged.length).toBeGreaterThan(0)
  })

  it('produces zero findings for a fully normal table with only optional blank cells (false-positive fix, case 4)', () => {
    const text = ['이름\t부서\t비고', '철수\t개발\t확인 필요', '영희\t기획\t', '민수\t영업\t'].join('\n')
    const doc = parseDocument(text)
    expect(runTableStructureRules(doc)).toEqual([])
  })

  it('detects the parent-context possibility under a multi-level header without asserting a merge (Test 7)', () => {
    const text = [
      'KKK\t정상 조건\t\t\t이상 조건\t\t',
      '\t두께\t온도\t시간\t두께\t온도\t시간',
      '\t100~200nm\t90~95℃\t60~70s\t<100nm\t>95℃\t>70s',
    ].join('\n')
    const doc = parseDocument(text)
    const findings = runTableStructureRules(doc)

    expect(findings).toHaveLength(1)
    const [finding] = findings
    expect(finding.category).toBe('scope')
    expect(finding.finding).toContain('KKK')
    expect(finding.finding).toContain('2, 3')

    // Column label falls back to a positional name here — row 0 holds "KKK"
    // for this column, not a column name, so it must never be quoted as if
    // it were the label ("KKK" 값이 비어 있는 행 would be self-contradictory).
    expect(finding.finding).toContain('1번째 열')
    expect(finding.finding).not.toContain('"KKK" 값이')

    // Must stay hedged, never assert an actual merge.
    expect(finding.finding).toContain('판단하기 어렵습니다')
    expect(finding.finding).not.toContain('병합되었습니다')
  })

  it('produces no findings for a two-level header with no first-column parent context', () => {
    const text = [
      '정상 조건\t\t\t이상 조건\t\t',
      '두께\t온도\t시간\t두께\t온도\t시간',
      '100~200nm\t90~95℃\t60~70s\t<100nm\t>95℃\t>70s',
    ].join('\n')
    const doc = parseDocument(text)
    expect(runTableStructureRules(doc)).toEqual([])
  })

  it('runs as part of the full rule engine and reports under an existing category (never "Excel error")', () => {
    const text = '제품명\t조건\t설명\nKKK\t얇음\tA\n\t두꺼움\tB'
    const doc = parseDocument(text)
    const result = runRuleEngine(doc)

    const tableFindings = result.findings.filter((f) => f.whatToCheck.some((c) => c.includes('원본 Excel')))
    expect(tableFindings.length).toBeGreaterThan(0)
    for (const f of tableFindings) {
      expect(['purpose', 'scope', 'definition', 'ambiguity', 'context', 'reference', 'condition', 'relationship', 'atomicKnowledge', 'duplication', 'structure', 'metadata']).toContain(f.category)
    }
  })
})
