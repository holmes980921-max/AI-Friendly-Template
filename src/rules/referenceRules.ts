import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { nextFindingId } from './helpers'

/** Specific reference phrases whose target is usually not identifiable from the phrase alone. */
const SPECIFIC_PHRASES = [
  '기존 조건',
  '동일 조건',
  '해당 제품',
  '해당 공정',
  '기존 내용',
  '관련 부서',
  '이 경우',
  '이 방법',
  '위와 같이',
  '위 내용',
  '아래 내용',
  '담당자',
  '이전 결과',
  '이전 조건',
]

/** Very generic references, only flagged when not already covered by a specific phrase above. */
const GENERIC_PHRASES = ['해당', '이것']

function findingFor(phrase: string, sentence: string): Finding {
  return {
    id: nextFindingId(),
    source: 'rule',
    category: 'reference',
    severity: 'high',
    title: '모호한 참조',
    targetText: sentence,
    finding: `"${phrase}"이 무엇을 의미하는지 문서 내에서 명확하게 확인하기 어렵습니다.`,
    whyItMatters:
      '검색 결과가 문서의 일부만 포함하는 경우 AI가 이 표현이 가리키는 대상을 추론해야 할 가능성이 있습니다.',
    whatToCheck: ['참조하는 대상이 무엇인지', '관련 문서가 있다면 어떤 문서인지', '적용 대상'],
    reviewQuestion: `"${phrase}"이 무엇인지 이 문서 또는 명시된 참조 정보만으로 확인할 수 있나요?`,
    confidence: 'medium',
  }
}

/**
 * Flags vague references (기존 조건, 담당자, 해당, 이것, ...) whose target may
 * not survive if only part of the document is retrieved by a search/RAG system.
 */
export function runReferenceRules(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = []

  for (const phrase of SPECIFIC_PHRASES) {
    const sentence = doc.sentences.find((s) => s.includes(phrase))
    if (sentence) findings.push(findingFor(phrase, sentence))
  }

  for (const phrase of GENERIC_PHRASES) {
    const sentence = doc.sentences.find((s) => {
      if (!s.includes(phrase)) return false
      return !SPECIFIC_PHRASES.some((specific) => specific.startsWith(phrase) && s.includes(specific))
    })
    if (sentence) findings.push(findingFor(phrase, sentence))
  }

  return findings
}
