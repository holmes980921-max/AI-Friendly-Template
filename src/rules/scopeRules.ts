import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { nextFindingId } from './helpers'

/** Matches phrases like "제품에 따라", "상황에 따라" — content that depends on an unstated scope. */
const SCOPE_DEPENDENCY_PATTERN = /([가-힣A-Za-z0-9]+)에\s*따라/g

/**
 * Flags statements whose meaning depends on product/process/equipment/team/
 * situation/etc. without that scope being defined elsewhere in the document.
 */
export function runScopeRules(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = []
  const seen = new Set<string>()

  for (const sentence of doc.sentences) {
    const matches = sentence.matchAll(SCOPE_DEPENDENCY_PATTERN)
    for (const match of matches) {
      const phrase = match[0]
      if (seen.has(phrase)) continue
      seen.add(phrase)

      findings.push({
        id: nextFindingId(),
        source: 'rule',
        category: 'scope',
        severity: 'medium',
        title: '적용 범위',
        targetText: sentence,
        finding: `"${phrase}"라는 표현이 있으나, 적용 대상 또는 범위가 문서 내에서 명확하게 정의되어 있는지 확인이 필요합니다.`,
        whyItMatters:
          '적용 대상이 명시되지 않으면, AI가 이 내용이 어떤 범위에 적용되는지 알 수 없어 잘못된 범위로 일반화할 가능성이 있습니다.',
        whatToCheck: ['구체적으로 어떤 대상/범위에 해당하는 내용인지', '범위별로 값이 어떻게 달라지는지에 대한 명시 여부'],
        reviewQuestion: `"${phrase}"에서 구체적인 적용 대상을 이 문서만으로 확인할 수 있나요?`,
        confidence: 'medium',
      })
    }
  }

  return findings
}
