import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { analyzeStructure } from '../utils/structureAnalysis'
import { nextFindingId } from './helpers'

const MIN_DETECTED_SECTIONS = 1

/**
 * Flags documents with almost no detectable structural signal (headings such
 * as 목적, 절차, 예외, 관련 문서, ...), which can make targeted AI retrieval harder.
 */
export function runStructureRules(doc: ParsedDocument): Finding[] {
  const { detected } = analyzeStructure(doc)
  if (detected.length >= MIN_DETECTED_SECTIONS) return []
  if (doc.sentences.length < 2) return []

  return [
    {
      id: nextFindingId(),
      source: 'rule',
      category: 'structure',
      severity: 'info',
      title: '문서 구조',
      targetText: doc.paragraphs[0] ?? doc.sentences[0] ?? '',
      finding:
        '제목, 목적, 절차, 예외, 관련 문서와 같은 구조적 신호가 문서에서 거의 발견되지 않았습니다.',
      whyItMatters:
        '구조적 신호가 없으면 AI 검색 시스템이 문서에서 필요한 부분을 찾기 어려울 가능성이 있습니다.',
      whatToCheck: ['문서에 소제목이나 구획을 추가할 수 있는지', '이 문서 유형에 어떤 구조가 적합할지'],
      reviewQuestion: '이 문서에 목적/절차/예외 등을 구분하는 소제목을 추가하면 도움이 될까요?',
      confidence: 'low',
    },
  ]
}
