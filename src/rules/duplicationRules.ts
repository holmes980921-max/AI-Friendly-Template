import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { nextFindingId } from './helpers'

const SUBJECT_PATTERN = /^(.{1,10}?)(은|는|이|가)\s/
const VALUE_TOKEN_PATTERN = /[A-Z]{1,4}\d*|\d+/g

function extractSubject(sentence: string): string | null {
  const match = sentence.match(SUBJECT_PATTERN)
  return match ? match[1] : null
}

function extractValueTokens(sentence: string): string[] {
  return Array.from(sentence.matchAll(VALUE_TOKEN_PATTERN), (m) => m[0])
}

/**
 * Flags sentences that share the same subject but assert different values,
 * which may indicate duplicated or conflicting statements about the same thing.
 */
export function runDuplicationRules(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = []
  const bySubject = new Map<string, string[]>()

  for (const sentence of doc.sentences) {
    const subject = extractSubject(sentence)
    if (!subject) continue
    if (!bySubject.has(subject)) bySubject.set(subject, [])
    bySubject.get(subject)!.push(sentence)
  }

  for (const [subject, sentences] of bySubject) {
    if (sentences.length < 2) continue

    for (let i = 0; i < sentences.length; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        const valuesA = extractValueTokens(sentences[i])
        const valuesB = extractValueTokens(sentences[j])
        if (valuesA.length === 0 || valuesB.length === 0) continue
        const differs = valuesA.join(',') !== valuesB.join(',')
        if (!differs) continue

        findings.push({
          id: nextFindingId(),
          source: 'rule',
          category: 'duplication',
          severity: 'medium',
          title: '중복 / 상충',
          targetText: `${sentences[i]} / ${sentences[j]}`,
          finding: `"${subject}"에 대해 서로 다른 내용이 문서 내 여러 곳에 존재하는지 확인이 필요합니다.`,
          whyItMatters:
            '동일 대상에 대한 정보가 서로 다르면, AI가 어느 쪽이 최신/유효한 정보인지 추론해야 할 가능성이 있습니다.',
          whatToCheck: ['두 내용 중 어느 것이 최신 정보인지', '두 내용이 실제로 같은 대상을 가리키는지'],
          reviewQuestion: `"${subject}"에 대한 두 내용이 서로 같은 것을 의미하나요, 아니면 다른 상황을 의미하나요?`,
          confidence: 'low',
        })
      }
    }
  }

  return findings
}
