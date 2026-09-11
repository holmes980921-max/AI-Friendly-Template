import type { ParsedDocument } from '../types/document'

/** Structural signals commonly useful in an AI-friendly knowledge document. */
export const STRUCTURE_KEYWORDS = [
  '제목',
  '목적',
  '적용 범위',
  '적용범위',
  '용어 정의',
  '용어정의',
  '대상',
  '조건',
  '본문',
  '절차',
  '예외',
  '주의사항',
  '문제 해결',
  '문제해결',
  '관련 문서',
  '관련문서',
  '담당 조직',
  '담당조직',
  '버전',
  '적용일',
] as const

const HEADING_MAX_LENGTH = 20

function normalize(keyword: string): string {
  return keyword.replace(/\s+/g, '')
}

function isHeadingLike(line: string): boolean {
  if (line.length > HEADING_MAX_LENGTH) return false
  return /[:：\]]$|^\[.*\]$|^#+\s|^\d+[.)]\s*\S+$/.test(line) || !/[.?!다요함음됨임]$/.test(line)
}

export interface StructureAnalysis {
  detected: string[]
}

/** Scans short, heading-like lines for known document-structure keywords. */
export function analyzeStructure(doc: ParsedDocument): StructureAnalysis {
  const detected = new Set<string>()

  for (const line of doc.lines) {
    if (!isHeadingLike(line)) continue
    const normalizedLine = normalize(line)
    for (const keyword of STRUCTURE_KEYWORDS) {
      if (normalizedLine.includes(normalize(keyword))) {
        detected.add(keyword.replace(/\s+/g, '').length > 2 ? keyword : keyword)
      }
    }
  }

  // De-duplicate spacing variants (e.g. "적용범위" vs "적용 범위") by preferring the spaced form.
  const canonical = new Map<string, string>()
  for (const keyword of detected) {
    const key = normalize(keyword)
    if (!canonical.has(key) || keyword.includes(' ')) canonical.set(key, keyword)
  }

  return { detected: Array.from(canonical.values()) }
}
