import type { Finding } from '../types/diagnostic'
import { CATEGORY_LABELS, SEVERITY_ICONS, SEVERITY_LABELS } from '../types/diagnostic'
import { SEVERITY_BADGE_CLASSES, SEVERITY_CARD_ACCENT } from './severityStyles'

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div
      className={`rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${SEVERITY_CARD_ACCENT[finding.severity]}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${SEVERITY_BADGE_CLASSES[finding.severity]}`}>
          {SEVERITY_ICONS[finding.severity]} {SEVERITY_LABELS[finding.severity]}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {CATEGORY_LABELS[finding.category]}
        </span>
        <span className="ml-auto text-xs text-slate-400">
          신뢰도: {finding.confidence} · 출처: {finding.source}
        </span>
      </div>

      <p className="mt-3 text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-300">발견: </span>
        <span className="text-slate-900 dark:text-slate-100">"{finding.targetText}"</span>
      </p>

      <dl className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
        <div>
          <dt className="font-semibold text-slate-700 dark:text-slate-300">문제</dt>
          <dd className="mt-0.5">{finding.finding}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700 dark:text-slate-300">AI 관점에서 확인이 필요한 이유</dt>
          <dd className="mt-0.5">{finding.whyItMatters}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700 dark:text-slate-300">확인이 필요한 사항</dt>
          <dd className="mt-0.5">
            <ul className="list-inside list-disc space-y-0.5">
              {finding.whatToCheck.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded bg-indigo-50 px-2 py-1.5 text-sm text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
        <span className="font-semibold">확인 질문: </span>
        {finding.reviewQuestion}
      </p>
    </div>
  )
}
