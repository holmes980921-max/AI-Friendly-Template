import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { nextFindingId } from './helpers'

/** Demonstrative + abstract-noun combos suggesting reliance on context defined elsewhere. */
const CONTEXT_TRIGGER_PHRASES = ['이 조건', '이 결과', '이 방식', '이 값', '이 수치', '이 기준']

/**
 * Flags statements that may only be understandable together with outside
 * knowledge not present in this part of the document (e.g. "이 조건으로 진행한다").
 */
export function runContextRules(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = []
  const seen = new Set<string>()

  for (const phrase of CONTEXT_TRIGGER_PHRASES) {
    const sentence = doc.sentences.find((s) => s.includes(phrase))
    if (!sentence || seen.has(sentence)) continue
    seen.add(sentence)

    findings.push({
      id: nextFindingId(),
      source: 'rule',
      category: 'context',
      severity: 'medium',
      title: '맥락 누락',
      targetText: sentence,
      finding: `"${phrase}"이 문서의 다른 부분(또는 문서 밖의 배경 지식)을 전제로 하고 있을 가능성이 있습니다.`,
      whyItMatters:
        'AI 검색 시스템이 문서의 일부만 가져오는 경우, 해당 부분만으로는 이 문장의 의미가 유지되지 않을 가능성이 있습니다.',
      whatToCheck: ['문서의 해당 부분만으로 의미가 유지되는지', '앞서 어떤 내용을 지칭하는지 본문에 명시할 필요가 있는지'],
      reviewQuestion: '이 문장만 따로 검색되어도 의미가 유지되나요?',
      confidence: 'low',
    })
  }

  return findings
}
