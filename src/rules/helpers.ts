import type { Confidence, Finding, Severity } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'

let idCounter = 0
export function nextFindingId(): string {
  idCounter += 1
  return `f-${idCounter}`
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Finds the first sentence containing the given literal term (not a regex). */
export function findFirstSentenceContaining(doc: ParsedDocument, term: string): string | null {
  const pattern = new RegExp(escapeRegExp(term))
  return doc.sentences.find((s) => pattern.test(s)) ?? null
}

/** Finds every distinct sentence containing the given literal term. */
export function findAllSentencesContaining(doc: ParsedDocument, term: string): string[] {
  const pattern = new RegExp(escapeRegExp(term))
  return doc.sentences.filter((s) => pattern.test(s))
}

interface BuildFindingArgs {
  category: Finding['category']
  severity: Severity
  title: string
  targetText: string
  finding: string
  whyItMatters: string
  whatToCheck: string[]
  reviewQuestion: string
  confidence: Confidence
}

export function buildFinding(args: BuildFindingArgs): Finding {
  return {
    id: nextFindingId(),
    source: 'rule',
    ...args,
  }
}
