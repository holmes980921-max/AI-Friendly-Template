import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { buildFinding } from './helpers'

const PURPOSE_KEYWORDS = ['목적', '가이드', '안내', '개요', '소개', '대응', '절차', '방법', '매뉴얼', '지침']
const SENTENCE_END_PATTERN = /[.?!다요함음됨임]$/

/**
 * Checks whether the document surfaces its topic/purpose early, before
 * diving into detailed content — a title-like first line, or an opening
 * sentence that mentions what the document is for.
 */
function looksLikePurposeSignal(firstParagraph: string): boolean {
  const firstLine = firstParagraph.split(/\r?\n/)[0]?.trim() ?? ''
  const isTitleLike = firstLine.length > 0 && firstLine.length <= 40 && !SENTENCE_END_PATTERN.test(firstLine)
  if (isTitleLike) return true
  return PURPOSE_KEYWORDS.some((kw) => firstParagraph.includes(kw))
}

export function runPurposeRules(doc: ParsedDocument): Finding[] {
  if (doc.paragraphs.length === 0) return []
  const firstParagraph = doc.paragraphs[0]

  if (looksLikePurposeSignal(firstParagraph)) return []
  if (doc.sentences.length < 2) return []

  const targetText = doc.sentences[0]

  return [
    buildFinding({
      category: 'purpose',
      severity: 'medium',
      title: '문서 목적',
      targetText,
      finding: '문서가 세부 내용으로 바로 시작되어, 문서의 목적 또는 주제가 명확하게 드러나는지 확인이 필요합니다.',
      whyItMatters:
        '문서의 목적이나 주제가 명확하지 않으면, AI가 문서 일부만 검색했을 때 이 내용이 어떤 상황에 대한 것인지 추론해야 할 가능성이 있습니다.',
      whatToCheck: ['문서의 목적 또는 주제를 앞부분에 명시할 필요가 있는지', '제목이 문서 내용을 충분히 설명하는지'],
      reviewQuestion: '이 문서의 목적 또는 주제를 문서 도입부만 보고 확인할 수 있나요?',
      confidence: 'low',
    }),
  ]
}
