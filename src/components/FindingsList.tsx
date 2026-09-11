import { useState } from 'react'
import type { Category, Finding, Severity } from '../types/diagnostic'
import { CATEGORY_LABELS, SEVERITY_LABELS } from '../types/diagnostic'
import { FindingCard } from './FindingCard'

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

const SEVERITY_FILTERS: (Severity | 'all')[] = ['all', 'high', 'medium', 'low', 'info']
const SEVERITY_FILTER_LABELS: Record<Severity | 'all', string> = {
  all: '전체',
  ...SEVERITY_LABELS,
}

export function FindingsList({ findings }: { findings: Finding[] }) {
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')
  const highPriority = findings.filter((f) => f.severity === 'high')
  const visible = severityFilter === 'all' ? findings : findings.filter((f) => f.severity === severityFilter)

  const byCategory = new Map<Category, Finding[]>()
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, [])
  for (const f of visible) byCategory.get(f.category)!.push(f)

  return (
    <div className="space-y-6">
      {highPriority.length > 0 && (
        <section className="rounded-lg border border-red-200 bg-red-50/50 p-6 dark:border-red-900 dark:bg-red-950/20">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-300">우선 확인 ({highPriority.length}건)</h2>
          <div className="mt-3 space-y-3">
            {highPriority.map((f) => (
              <FindingCard key={f.id} finding={f} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">상세 진단</h2>
          <div className="flex gap-1">
            {SEVERITY_FILTERS.map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`rounded px-2 py-1 text-xs font-medium ${
                  severityFilter === sev
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {SEVERITY_FILTER_LABELS[sev]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {CATEGORY_ORDER.map((cat) => {
            const items = byCategory.get(cat)!
            if (items.length === 0) return null
            return (
              <details key={cat} open className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {CATEGORY_LABELS[cat]} ({items.length}건)
                </summary>
                <div className="mt-3 space-y-3">
                  {items.map((f) => (
                    <FindingCard key={f.id} finding={f} />
                  ))}
                </div>
              </details>
            )
          })}
          {visible.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">해당 조건에 맞는 진단 항목이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  )
}
