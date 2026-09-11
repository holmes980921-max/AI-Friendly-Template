import type { Finding } from '../types/diagnostic'
import type { ParsedDocument, TableGrid } from '../types/document'
import { nextFindingId } from './helpers'

interface UncertainGroup {
  col: number
  possibleContext: string
  rowNumbers: number[]
  sampleRowSummary: string
}

/** Builds a short "값1, 값2" summary of a row's other populated cells, for context in the finding text. */
function summarizeRow(row: { col: number; value: string }[], excludeCol: number): string {
  return row
    .filter((cell) => cell.col !== excludeCol && cell.value !== '')
    .map((cell) => cell.value)
    .join(', ')
}

/**
 * Resolves a human-readable label for a column. There is no single
 * privileged "header row" anymore (multi-level headers make that
 * assumption unsafe), so this only reuses row 0's text as a label when the
 * table shows no multi-level-header signal at all — otherwise row 0 may
 * itself hold a parent-context value (like "KKK") rather than a column
 * name, and mislabeling it as one would be exactly the kind of invented
 * certainty this tool must avoid. When in doubt, fall back to a plain
 * positional label.
 */
function getColumnLabel(table: TableGrid, col: number): string {
  if (table.possibleHeaderRowIndices.length === 0) {
    const candidate = table.rows[0]?.[col]?.value
    if (candidate) return candidate
  }
  return `${col + 1}번째 열`
}

/**
 * Flags empty table cells that follow a non-empty value earlier in the same
 * column — the exact ambiguity a merged cell produces once copied to plain
 * clipboard TSV. This NEVER asserts that the cell is merged or that it
 * "belongs to" the earlier value; it only surfaces that possibility for the
 * document author to confirm against the original spreadsheet.
 */
export function runTableStructureRules(doc: ParsedDocument): Finding[] {
  const table = doc.table
  if (!table) return []

  const groups = new Map<string, UncertainGroup>()

  for (const row of table.rows) {
    for (const cell of row) {
      if (cell.state !== 'structurally-uncertain' || cell.possibleContext === undefined) continue

      const key = `${cell.col}::${cell.possibleContext}`
      let group = groups.get(key)
      if (!group) {
        group = {
          col: cell.col,
          possibleContext: cell.possibleContext,
          rowNumbers: [],
          sampleRowSummary: summarizeRow(row, cell.col),
        }
        groups.set(key, group)
      }
      group.rowNumbers.push(cell.row + 1)
    }
  }

  const findings: Finding[] = []
  for (const group of groups.values()) {
    const columnLabel = getColumnLabel(table, group.col)
    const rowList = group.rowNumbers.join(', ')

    findings.push({
      id: nextFindingId(),
      source: 'rule',
      category: 'scope',
      severity: 'high',
      title: '적용 범위',
      targetText: `[${columnLabel} = 빈 셀] ${group.sampleRowSummary}`,
      finding: `"${columnLabel}" 값이 비어 있는 행(${rowList}번째 행)이 있습니다. 원본 표에서 이 셀이 위쪽의 "${group.possibleContext}"가 해당 행까지 적용되는 구조인지, 실제로 값이 없는 셀인지는 현재 붙여넣은 데이터만으로는 판단하기 어렵습니다.`,
      whyItMatters: `AI가 이 데이터를 해석할 경우, 비어 있는 "${columnLabel}"의 적용 대상을 "${group.possibleContext}"로 추론해야 할 가능성이 있습니다.`,
      whatToCheck: [
        `${rowList}번째 행이 "${group.possibleContext}"에 적용되는 항목인지 원본 표에서 확인`,
        '원본 Excel에서 해당 셀이 병합되어 있었는지 확인',
      ],
      reviewQuestion: `${rowList}번째 행의 "${columnLabel}"이(가) "${group.possibleContext}"에 해당하는 항목인가요?`,
      confidence: 'medium',
    })
  }

  return findings
}
