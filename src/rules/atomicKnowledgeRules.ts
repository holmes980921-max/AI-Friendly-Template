import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { nextFindingId } from './helpers'

const KNOWLEDGE_TYPE_MARKERS: Record<string, string[]> = {
  background: ['배경', '개요', '때문에', '이유'],
  condition: ['조건', '경우', '따라', '하면'],
  procedure: ['진행', '처리', '절차', '방법', '실시'],
  exception: ['예외', '다만', '제외', '필요하면'],
  result: ['결과', '완료', '비교'],
}

const MIN_DISTINCT_TYPES = 3

/**
 * Flags paragraphs that mix several different kinds of knowledge (background,
 * condition, procedure, exception, result) into a single block of text.
 */
export function runAtomicKnowledgeRules(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = []

  for (const paragraph of doc.paragraphs) {
    const typesPresent = Object.entries(KNOWLEDGE_TYPE_MARKERS)
      .filter(([, markers]) => markers.some((m) => paragraph.includes(m)))
      .map(([type]) => type)

    if (typesPresent.length < MIN_DISTINCT_TYPES) continue

    const preview = paragraph.length > 80 ? `${paragraph.slice(0, 80)}...` : paragraph

    findings.push({
      id: nextFindingId(),
      source: 'rule',
      category: 'atomicKnowledge',
      severity: 'low',
      title: '정보 혼합',
      targetText: preview,
      finding: '서로 다른 종류의 정보가 하나의 문단에 혼합되어 있습니다.',
      whyItMatters:
        '검색 및 재사용 시 문단의 일부만 추출될 경우, 각 정보(배경/조건/절차/예외/결과)의 의미가 온전히 유지되지 않을 가능성이 있습니다.',
      whatToCheck: ['각 정보의 의미가 유지되도록 문단을 분리할 필요가 있는지', '조건과 절차, 예외를 구분해서 서술할 수 있는지'],
      reviewQuestion: '이 문단을 배경/조건/절차/예외/결과로 나누어도 의미가 유지되나요?',
      confidence: 'low',
    })
  }

  return findings
}
