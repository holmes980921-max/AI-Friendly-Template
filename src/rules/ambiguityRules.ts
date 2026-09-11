import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { nextFindingId } from './helpers'

/** Vague qualifiers whose judgment criteria are usually not spelled out. */
const SIMPLE_TERMS = [
  '적절히',
  '충분히',
  '빠르게',
  '최근',
  '정상',
  '이상',
  '필요하면',
  '상황에 따라',
  '적당히',
  '문제 발생 시',
  '문제가 발생',
  '동일하게',
  '일반적으로',
  '보통',
  '적합한',
  '적절한',
]

/**
 * "기존"/"관련" are also handled by referenceRules as part of longer phrases
 * (기존 조건, 관련 부서). Skip those specific combos here to avoid firing on
 * the exact same quote twice for the same underlying reason.
 */
const CONTEXTUAL_TERMS: { term: string; excludeFollowing: string[] }[] = [
  { term: '기존', excludeFollowing: ['조건', '내용'] },
  { term: '관련', excludeFollowing: ['부서', '문서'] },
]

/** Measurement-like nouns whose "how much" is often left as a relative judgment. */
const MEASUREMENT_NOUNS = ['두께', '길이', '온도', '압력', '시간', '무게', '속도', '강도', '농도', '크기']

/** Relative adjective stems combined with a conditional ending (얇으면, 두꺼우면, 빠르면, ...). */
const RELATIVE_ADJECTIVE_PATTERN = /(얇|두껍|길|짧|높|낮|많|적|크|작|빠르|느리)(?:으면|면)/

function relativeThresholdFinding(sentence: string, match: string): Finding {
  return {
    id: nextFindingId(),
    source: 'rule',
    category: 'ambiguity',
    severity: 'medium',
    title: '모호한 표현',
    targetText: sentence,
    finding: `"${match}"와 같이 상대적인 기준으로 조건이 표현되어 있으나, 구체적인 수치나 기준값이 문서 내에서 확인되지 않습니다.`,
    whyItMatters:
      '구체적인 기준값이 없으면, AI가 어느 정도를 기준으로 판단해야 하는지 스스로 추론해야 할 가능성이 있습니다.',
    whatToCheck: ['구체적인 수치 기준(예: 임계값, 범위)이 있는지', '기준이 다른 문서에 정의되어 있다면 그 위치'],
    reviewQuestion: `"${match}"의 구체적인 기준을 이 문서만으로 확인할 수 있나요?`,
    confidence: 'medium',
  }
}

function findingFor(term: string, sentence: string): Finding {
  return {
    id: nextFindingId(),
    source: 'rule',
    category: 'ambiguity',
    severity: 'medium',
    title: '모호한 표현',
    targetText: sentence,
    finding: `"${term}"의 판단 기준이 문서 내에서 명확한지 확인이 필요합니다.`,
    whyItMatters:
      '판단 기준이 문서에 없으면, AI가 무엇을 기준으로 판단해야 하는지 스스로 추론해야 할 가능성이 있습니다.',
    whatToCheck: [`"${term}"에 대한 구체적인 기준이나 수치가 있는지`, '기준이 다른 문서에 정의되어 있다면 그 위치'],
    reviewQuestion: `"${term}"의 판단 기준을 이 문서만으로 확인할 수 있나요?`,
    confidence: 'medium',
  }
}

export function runAmbiguityRules(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = []

  for (const term of SIMPLE_TERMS) {
    const sentence = doc.sentences.find((s) => s.includes(term))
    if (sentence) findings.push(findingFor(term, sentence))
  }

  for (const { term, excludeFollowing } of CONTEXTUAL_TERMS) {
    const sentence = doc.sentences.find((s) => {
      if (!s.includes(term)) return false
      return !excludeFollowing.some((suffix) => s.includes(`${term}${suffix}`) || s.includes(`${term} ${suffix}`))
    })
    if (sentence) findings.push(findingFor(term, sentence))
  }

  for (const sentence of doc.sentences) {
    if (/\d/.test(sentence)) continue
    if (!MEASUREMENT_NOUNS.some((noun) => sentence.includes(noun))) continue
    const match = sentence.match(RELATIVE_ADJECTIVE_PATTERN)
    if (match) findings.push(relativeThresholdFinding(sentence, match[0]))
  }

  return findings
}
