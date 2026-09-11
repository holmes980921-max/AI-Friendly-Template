export type Category =
  | 'purpose'
  | 'scope'
  | 'definition'
  | 'ambiguity'
  | 'context'
  | 'reference'
  | 'condition'
  | 'relationship'
  | 'atomicKnowledge'
  | 'duplication'
  | 'structure'
  | 'metadata'

export type Severity = 'high' | 'medium' | 'low' | 'info'

export type Confidence = 'high' | 'medium' | 'low'

export type FindingSource = 'rule' | 'llm'

/**
 * V2-compatible diagnostic finding shape. `source` distinguishes rule-engine
 * output (V1) from a future LLM semantic-analysis finding (V2) without a
 * schema change to the UI or rule engine.
 */
export interface Finding {
  id: string
  category: Category
  severity: Severity
  title: string
  targetText: string
  finding: string
  whyItMatters: string
  whatToCheck: string[]
  reviewQuestion: string
  confidence: Confidence
  source: FindingSource
}

export const CATEGORY_LABELS: Record<Category, string> = {
  purpose: '문서 목적',
  scope: '적용 범위',
  definition: '용어 정의',
  ambiguity: '모호한 표현',
  context: '맥락 누락',
  reference: '모호한 참조',
  condition: '조건 / 예외',
  relationship: '관계 연결',
  atomicKnowledge: '정보 혼합',
  duplication: '중복 / 상충',
  structure: '문서 구조',
  metadata: '메타데이터',
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3,
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
  info: '참고',
}

export const SEVERITY_ICONS: Record<Severity, string> = {
  high: '🔴',
  medium: '🟠',
  low: '🟡',
  info: '🔵',
}
