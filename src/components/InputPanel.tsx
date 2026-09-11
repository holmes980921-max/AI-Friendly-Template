interface InputPanelProps {
  text: string
  onTextChange: (text: string) => void
  onLoadSample: () => void
  onLoadSampleTable: () => void
  onAnalyze: () => void
  onClear: () => void
  canAnalyze: boolean
  error: string | null
}

export function InputPanel({
  text,
  onTextChange,
  onLoadSample,
  onLoadSampleTable,
  onAnalyze,
  onClear,
  canAnalyze,
  error,
}: InputPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">1. 문서 붙여넣기</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        사내 지식 문서를 붙여넣어 주세요. Excel에서 셀을 복사(Ctrl+C)하여 그대로 붙여넣어도(Ctrl+V) 됩니다. 입력한
        문서는 브라우저 내에서만 분석되며 외부로 전송되지 않습니다.
      </p>

      <textarea
        className="mt-4 h-64 w-full resize-y rounded-md border border-slate-200 p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        placeholder="사내 지식 문서를 붙여넣어 주세요."
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        spellCheck={false}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onLoadSample}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          예시 문서 불러오기
        </button>
        <button
          type="button"
          onClick={onLoadSampleTable}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          예시 표(Excel 붙여넣기) 불러오기
        </button>
        {text && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            지우기
          </button>
        )}

        <div className="grow" />

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
        >
          진단하기
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
    </section>
  )
}
