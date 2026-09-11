const RECOMMENDED_STRUCTURE = [
  '제목',
  '목적',
  '적용 범위',
  '주요 용어 및 정의',
  '대상 / 조건',
  '핵심 내용',
  '절차 또는 대응 방법',
  '예외 / 주의사항',
  '관련 문서',
  '담당 조직',
  '버전 / 적용일',
]

export function DocumentTemplateGuide() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">권장 문서 구조</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        아래는 하나의 참고용 가이드입니다. 모든 문서가 아래 항목을 전부 포함해야 하는 것은 아니며, 문서 유형에 따라
        적합한 구조는 달라질 수 있습니다.
      </p>
      <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-slate-700 dark:text-slate-300">
        {RECOMMENDED_STRUCTURE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  )
}
