import { useState } from 'react'
import type { Finding } from '../types/diagnostic'
import { SEVERITY_ICONS, SEVERITY_LABELS } from '../types/diagnostic'
import { SEVERITY_BADGE_CLASSES } from './severityStyles'

export function ReviewQuestions({ findings }: { findings: Finding[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (findings.length === 0) return null

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">확인 질문</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        아래 질문에 답해 보면, AI가 추론해야 할 수도 있는 부분을 문서 작성자가 직접 보완할 수 있습니다. 체크는 이 세션에서만
        유지되며 저장되지 않습니다.
      </p>
      <ul className="mt-4 space-y-2">
        {findings.map((f) => (
          <li key={f.id} className="flex items-start gap-3 rounded-md border border-slate-100 p-2 dark:border-slate-800">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0"
              checked={checked.has(f.id)}
              onChange={() => toggle(f.id)}
            />
            <div className={checked.has(f.id) ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}>
              <span
                className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-semibold ${SEVERITY_BADGE_CLASSES[f.severity]}`}
              >
                {SEVERITY_ICONS[f.severity]} {SEVERITY_LABELS[f.severity]}
              </span>
              {f.reviewQuestion}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
