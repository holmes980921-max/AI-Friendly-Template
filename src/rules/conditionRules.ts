import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { nextFindingId } from './helpers'

/** Matches "~에 따라 다르다/다를 수 있다" style statements about condition-dependent behavior. */
const CONDITION_DEPENDENCY_PATTERN = /([가-힣A-Za-z0-9]+에\s*따라)[^.\n]*?(다르|다를 수)/g

/**
 * Flags statements that say behavior depends on a condition, without stating
 * which condition maps to which case/exception.
 */
export function runConditionRules(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = []
  const seen = new Set<string>()

  for (const sentence of doc.sentences) {
    const matches = sentence.matchAll(CONDITION_DEPENDENCY_PATTERN)
    for (const match of matches) {
      const phrase = match[1]
      if (seen.has(phrase)) continue
      seen.add(phrase)

      findings.push({
        id: nextFindingId(),
        source: 'rule',
        category: 'condition',
        severity: 'high',
        title: '조건 / 예외',
        targetText: sentence,
        finding: `"${phrase}" 조건에 따라 내용이 달라진다고 되어 있으나, 조건별 적용 대상 또는 예외 조건이 문서 내에서 명확하게 연결되어 있는지 확인이 필요합니다.`,
        whyItMatters:
          '조건과 그에 따른 결과가 명시적으로 연결되어 있지 않으면, AI가 어떤 조건에 어떤 내용이 적용되는지 추론해야 할 가능성이 있습니다.',
        whatToCheck: ['각 조건에 어떤 내용/값이 대응되는지', '예외 조건이 별도로 존재하는지'],
        reviewQuestion: `"${phrase}"에서 조건별로 구체적으로 무엇이 달라지는지 이 문서만으로 확인할 수 있나요?`,
        confidence: 'medium',
      })
    }
  }

  return findings
}
