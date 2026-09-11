import type { ParsedDocument } from '../types/document'
import { TablePreview } from './TablePreview'

const PREVIEW_CHAR_LIMIT = 1200

export function DocumentPreview({ doc }: { doc: ParsedDocument }) {
  const preview = doc.rawText.length > PREVIEW_CHAR_LIMIT ? `${doc.rawText.slice(0, PREVIEW_CHAR_LIMIT)}...` : doc.rawText

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">문서 미리보기</h2>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="문단 수" value={doc.paragraphCount} />
        <Stat label="줄 수" value={doc.lineCount} />
        <Stat label="문장 수" value={doc.sentenceCount} />
        <Stat label="글자 수" value={doc.charCount} />
      </div>

      <div className="mt-4">
        {doc.table ? (
          <TablePreview table={doc.table} />
        ) : (
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {preview}
          </pre>
        )}
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 text-center dark:border-slate-700">
      <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">{value.toLocaleString()}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  )
}
