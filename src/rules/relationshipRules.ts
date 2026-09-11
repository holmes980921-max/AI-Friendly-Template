import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { nextFindingId } from './helpers'

const PROBLEM_KEYWORDS = ['문제', '이상', '오류', '장애', '불량']
const ACTION_KEYWORDS = ['조치', '대응', '처리', '확인', '진행', '문의']
const EXPLICIT_RELATION_MARKERS = ['원인:', '조치:', '대응:', '단계', '절차']

/**
 * Flags documents that mention both a problem and an action/response without
 * any explicit structural marker connecting cause to action.
 */
export function runRelationshipRules(doc: ParsedDocument): Finding[] {
  const hasProblem = PROBLEM_KEYWORDS.some((kw) => doc.rawText.includes(kw))
  const hasAction = ACTION_KEYWORDS.some((kw) => doc.rawText.includes(kw))
  const hasExplicitMarker = EXPLICIT_RELATION_MARKERS.some((kw) => doc.rawText.includes(kw))

  if (!hasProblem || !hasAction || hasExplicitMarker) return []

  const targetText =
    doc.sentences.find((s) => PROBLEM_KEYWORDS.some((kw) => s.includes(kw))) ?? doc.sentences[0] ?? ''

  return [
    {
      id: nextFindingId(),
      source: 'rule',
      category: 'relationship',
      severity: 'low',
      title: '관계 연결',
      targetText,
      finding:
        '문제 상황과 대응/조치 내용이 함께 언급되어 있으나, 이 둘의 관계(무엇이 원인이고 무엇이 조치인지)가 문서 구조상 명확하게 연결되어 있는지 확인이 필요합니다.',
      whyItMatters:
        '문제-원인-조치와 같은 관계가 명시적으로 구분되어 있지 않으면, AI가 어떤 내용이 원인이고 어떤 내용이 대응 방법인지 추론해야 할 가능성이 있습니다.',
      whatToCheck: ['문제 상황과 조치 내용을 구분해서 서술할 필요가 있는지', '조건 → 결과, 문제 → 대응과 같은 관계가 명확한지'],
      reviewQuestion: '문제 상황과 그에 대한 조치가 문서 내에서 명확하게 구분되어 있나요?',
      confidence: 'low',
    },
  ]
}
