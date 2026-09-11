import type { Category, Finding } from '../types/diagnostic'
import { CATEGORY_LABELS } from '../types/diagnostic'
import type { DiagnosticSummary } from '../rules/ruleEngine'
import { categoryIcon } from './severityStyles'

interface DashboardProps {
  summary: DiagnosticSummary
  findings: Finding[]
}

const CATEGORY_ORDER: Category[] = [
  'purpose',
  'scope',
  'definition',
  'ambiguity',
  'context',
  'reference',
  'condition',
  'relationship',
  'atomicKnowledge',
  'duplication',
  'structure',
  'metadata',
]

export function Dashboard({ summary, findings }: DashboardProps) {
  const countsByCategory = new Map<Category, { high: number; medium: number; low: number; info: number }>()
  for (const cat of CATEGORY_ORDER) countsByCategory.set(cat, { high: 0, medium: 0, low: 0, info: 0 })
  for (const finding of findings) {
    countsByCategory.get(finding.category)![finding.severity] += 1
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">문서 진단 결과</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        문서의 구조와 표현을 기반으로 한 진단 결과입니다. 과학적으로 검증된 점수가 아닌, 확인을 돕기 위한 참고 지표입니다.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-red-200 bg-red-50/60 p-4 text-center dark:border-red-900 dark:bg-red-950/30">
          <div className="text-3xl font-semibold text-red-700 dark:text-red-300">{summary.priorityCheck}</div>
          <div className="mt-1 text-sm font-medium text-red-700 dark:text-red-300">우선 확인</div>
        </div>
        <div className="rounded-md border border-orange-200 bg-orange-50/60 p-4 text-center dark:border-orange-900 dark:bg-orange-950/30">
          <div className="text-3xl font-semibold text-orange-700 dark:text-orange-300">{summary.recommendedCheck}</div>
          <div className="mt-1 text-sm font-medium text-orange-700 dark:text-orange-300">확인 권장</div>
        </div>
        <div className="rounded-md border border-sky-200 bg-sky-50/60 p-4 text-center dark:border-sky-900 dark:bg-sky-950/30">
          <div className="text-3xl font-semibold text-sky-700 dark:text-sky-300">{summary.forReference}</div>
          <div className="mt-1 text-sm font-medium text-sky-700 dark:text-sky-300">참고</div>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">카테고리별 요약</h3>
        <ul className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
          {CATEGORY_ORDER.map((cat) => {
            const counts = countsByCategory.get(cat)!
            const total = counts.high + counts.medium + counts.low + counts.info
            return (
              <li key={cat} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-slate-700 dark:text-slate-300">{CATEGORY_LABELS[cat]}</span>
                <span className="flex items-center gap-2">
                  <span>{categoryIcon(counts)}</span>
                  <span className="text-slate-500 dark:text-slate-400">{total}건</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
