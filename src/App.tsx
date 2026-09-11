import { useMemo, useState } from 'react'
import { InputPanel } from './components/InputPanel'
import { DocumentPreview } from './components/DocumentPreview'
import { Dashboard } from './components/Dashboard'
import { FindingsList } from './components/FindingsList'
import { ReviewQuestions } from './components/ReviewQuestions'
import { DocumentStructure } from './components/DocumentStructure'
import { DocumentTemplateGuide } from './components/DocumentTemplateGuide'
import { parseDocument } from './utils/textParser'
import { runRuleEngine, type DiagnosticResult } from './rules/ruleEngine'
import { SAMPLE_DOCUMENT } from './sample/sampleDocument'
import { SAMPLE_TABLE_TSV } from './sample/sampleTable'

function App() {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DiagnosticResult | null>(null)

  const doc = useMemo(() => (text.trim() === '' ? null : parseDocument(text)), [text])
  const canAnalyze = Boolean(doc && doc.sentences.length > 0)

  const handleTextChange = (value: string) => {
    setText(value)
    setResult(null)
    setError(null)
  }

  const handleLoadSample = () => {
    setText(SAMPLE_DOCUMENT)
    setResult(null)
    setError(null)
  }

  const handleLoadSampleTable = () => {
    setText(SAMPLE_TABLE_TSV)
    setResult(null)
    setError(null)
  }

  const handleClear = () => {
    setText('')
    setResult(null)
    setError(null)
  }

  const handleAnalyze = () => {
    if (!doc) {
      setError('진단할 문서가 없습니다. 문서를 붙여넣어 주세요.')
      return
    }
    setError(null)
    setResult(runRuleEngine(doc))
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI 지식 문서 진단 가이드</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            사내 지식 문서를 AI가 보다 명확하게 이해할 수 있도록, 확인이 필요한 정보와 맥락을 찾아드립니다.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            입력한 문서는 브라우저 내에서만 분석되며 외부로 전송되지 않습니다.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <InputPanel
          text={text}
          onTextChange={handleTextChange}
          onLoadSample={handleLoadSample}
          onLoadSampleTable={handleLoadSampleTable}
          onAnalyze={handleAnalyze}
          onClear={handleClear}
          canAnalyze={canAnalyze}
          error={error}
        />

        {doc && <DocumentPreview doc={doc} />}

        {result && (
          <>
            <Dashboard summary={result.summary} findings={result.findings} />
            <FindingsList findings={result.findings} />
            <ReviewQuestions findings={result.findings} />
            {doc && <DocumentStructure doc={doc} />}
            <DocumentTemplateGuide />
          </>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 pt-2 text-center text-xs text-slate-400">
        V1 — 규칙 기반 구조 진단만 수행합니다. 문서를 자동으로 수정하지 않으며, LLM을 사용하지 않습니다.
      </footer>
    </div>
  )
}

export default App
