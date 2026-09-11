import type { TableGrid } from '../types/document'

/** Renders the parsed grid as-is — never showing a forward-filled/guessed value for an uncertain cell. */
export function TablePreview({ table }: { table: TableGrid }) {
  return (
    <div>
      <p className="mb-2 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
        표 형태의 데이터가 감지되었습니다. 빈 셀은 원본 그대로 비워 두었으며, 값을 자동으로 채우지 않았습니다.
      </p>
      {table.possibleHeaderRowIndices.length > 0 && (
        <p className="mb-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          다단 헤더 구조가 포함되어 있을 가능성이 있습니다. 위쪽 행({table.possibleHeaderRowIndices.map((i) => i + 1).join(', ')}
          번째 행)이 열을 그룹으로 묶는 라벨일 수 있으나, 실제로 병합되어 있었는지는 확인할 수 없습니다.
        </p>
      )}
      <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
        <table className="min-w-full border-collapse text-sm">
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell) => {
                  if (cell.state === 'value') {
                    return (
                      <td
                        key={cell.col}
                        className="border border-slate-200 px-3 py-2 text-slate-800 dark:border-slate-700 dark:text-slate-100"
                      >
                        {cell.value}
                      </td>
                    )
                  }
                  if (cell.state === 'structurally-uncertain') {
                    return (
                      <td
                        key={cell.col}
                        className="border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        title={`원본 표에서 "${cell.possibleContext}"가 이 행까지 적용되는 구조인지 확인이 필요합니다.`}
                      >
                        확인 필요
                      </td>
                    )
                  }
                  return (
                    <td key={cell.col} className="border border-slate-100 px-3 py-2 dark:border-slate-800">
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        행 {table.rowCount.toLocaleString()}개 · 열 {table.columnCount.toLocaleString()}개 · "확인 필요"로 표시된
        셀은 위쪽 행의 값이 해당 행까지 적용되는 구조였을 가능성이 있으나, 붙여넣은 데이터만으로는 확정할 수
        없습니다.
      </p>
    </div>
  )
}
