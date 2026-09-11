import type { Finding } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { nextFindingId } from './helpers'

const METADATA_KEYWORDS = ['담당 조직', '담당조직', '작성자', '버전', '적용일', '변경 이력', '변경이력', '관련 문서', '관련문서']
const SUBSTANTIAL_DOC_LENGTH = 200

/**
 * Flags reasonably substantial documents that show no metadata (owner,
 * version, effective date, related documents, ...) at all.
 */
export function runMetadataRules(doc: ParsedDocument): Finding[] {
  if (doc.charCount < SUBSTANTIAL_DOC_LENGTH) return []

  const hasMetadata = METADATA_KEYWORDS.some((kw) => doc.rawText.includes(kw))
  if (hasMetadata) return []

  return [
    {
      id: nextFindingId(),
      source: 'rule',
      category: 'metadata',
      severity: 'info',
      title: '메타데이터',
      targetText: doc.paragraphs[0] ?? '',
      finding: '담당 조직, 작성자, 버전, 적용일과 같은 메타데이터가 문서에서 발견되지 않았습니다.',
      whyItMatters:
        '메타데이터가 없으면 이 정보가 언제, 누구에 의해, 어떤 범위로 작성되었는지 AI와 사용자 모두 확인하기 어려울 가능성이 있습니다.',
      whatToCheck: ['담당 조직 또는 작성자를 명시할 필요가 있는지', '버전 또는 적용일 정보가 필요한지'],
      reviewQuestion: '이 문서의 담당 조직, 버전, 적용일 정보가 필요한가요?',
      confidence: 'low',
    },
  ]
}
