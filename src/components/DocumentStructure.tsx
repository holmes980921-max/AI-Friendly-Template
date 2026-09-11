import type { ParsedDocument } from '../types/document'
import { analyzeStructure } from '../utils/structureAnalysis'

export function DocumentStructure({ doc }: { doc: ParsedDocument }) {
  const { detected } = analyzeStructure(doc)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">문서 구조</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        문서에서 감지된 구조적 신호입니다. 모든 문서가 모든 항목을 포함할 필요는 없습니다.
      </p>

      {detected.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {detected.map((section) => (
            <li
              key={section}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              ✓ {section}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          감지된 구조적 신호(소제목 등)가 거의 없습니다.
        </p>
      )}
    </section>
  )
}
