import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { findFirstSentenceContaining, nextFindingId } from './helpers'

const ABBREVIATION_PATTERN = /\b[A-Z]{2,6}\b/g

/** A definition looks like "PR(포토레지스트)", "PR: 설명", "PR란 ~", "PR는 ~를 의미". */
function hasInlineDefinition(rawText: string, token: string): boolean {
  const patterns = [
    new RegExp(`${token}\\s*[(（]`),
    new RegExp(`${token}\\s*[:：]`),
    new RegExp(`${token}\\s*(?:란|이란)`),
    new RegExp(`${token}\\s*(?:는|은)\\s*[^.\\n]*의미`),
  ]
  return patterns.some((p) => p.test(rawText))
}

/**
 * Flags uppercase abbreviations/codes (PR, ABC, CVD, ...) that appear without
 * any visible definition elsewhere in the document.
 */
export function runDefinitionRules(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = []
  const tokens = new Set(Array.from(doc.rawText.matchAll(ABBREVIATION_PATTERN), (m) => m[0]))

  for (const token of tokens) {
    if (hasInlineDefinition(doc.rawText, token)) continue

    const targetText = findFirstSentenceContaining(doc, token)
    if (!targetText) continue

    findings.push({
      id: nextFindingId(),
      source: 'rule',
      category: 'definition',
      severity: 'medium',
      title: '용어 정의',
      targetText,
      finding: `"${token}"의 의미가 문서 내에서 명확하게 정의되어 있는지 확인이 필요합니다.`,
      whyItMatters:
        '약어나 사내 용어는 문서 밖의 배경 지식을 전제로 하는 경우가 많아, AI가 이 용어의 의미를 추론해야 할 가능성이 있습니다.',
      whatToCheck: [`"${token}"이 무엇의 약자 또는 명칭인지`, '문서 내 다른 곳에 정의나 설명이 있는지'],
      reviewQuestion: `"${token}"의 의미를 이 문서만으로 확인할 수 있나요?`,
      confidence: 'medium',
    })
  }

  return findings
}
