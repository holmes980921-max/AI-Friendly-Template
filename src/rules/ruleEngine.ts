import type { Category, Finding, Severity } from '../types/diagnostic'
import { SEVERITY_ORDER } from '../types/diagnostic'
import type { ParsedDocument } from '../types/document'
import { runPurposeRules } from './purposeRules'
import { runScopeRules } from './scopeRules'
import { runDefinitionRules } from './definitionRules'
import { runAmbiguityRules } from './ambiguityRules'
import { runContextRules } from './contextRules'
import { runReferenceRules } from './referenceRules'
import { runConditionRules } from './conditionRules'
import { runRelationshipRules } from './relationshipRules'
import { runAtomicKnowledgeRules } from './atomicKnowledgeRules'
import { runDuplicationRules } from './duplicationRules'
import { runStructureRules } from './structureRules'
import { runMetadataRules } from './metadataRules'
import { runTableStructureRules } from './tableStructureRules'

export interface DiagnosticSummary {
  totalFindings: number
  /** 우선 확인 (HIGH), 확인 권장 (MEDIUM+LOW), 참고 (INFO). */
  priorityCheck: number
  recommendedCheck: number
  forReference: number
  bySeverity: Record<Severity, number>
  byCategory: Record<Category, number>
}

export interface DiagnosticResult {
  findings: Finding[]
  summary: DiagnosticSummary
}

const ALL_CATEGORIES: Category[] = [
  'purpose',
  'scope',
  'definition',
  'ambiguity',
  'context',
  'reference',
  'condition',
  'relationship',
  'atomicKnowledge',
  'duplication',
  'structure',
  'metadata',
]

/** Central rule engine for knowledge-document diagnostics. Each rule module is independent and easy to extend. */
export function runRuleEngine(doc: ParsedDocument): DiagnosticResult {
  const findings: Finding[] = [
    ...runPurposeRules(doc),
    ...runScopeRules(doc),
    ...runDefinitionRules(doc),
    ...runAmbiguityRules(doc),
    ...runContextRules(doc),
    ...runReferenceRules(doc),
    ...runConditionRules(doc),
    ...runRelationshipRules(doc),
    ...runAtomicKnowledgeRules(doc),
    ...runDuplicationRules(doc),
    ...runStructureRules(doc),
    ...runMetadataRules(doc),
    ...runTableStructureRules(doc),
  ].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  const bySeverity: Record<Severity, number> = { high: 0, medium: 0, low: 0, info: 0 }
  const byCategory: Record<Category, number> = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, 0])) as Record<
    Category,
    number
  >

  for (const finding of findings) {
    bySeverity[finding.severity] += 1
    byCategory[finding.category] += 1
  }

  return {
    findings,
    summary: {
      totalFindings: findings.length,
      priorityCheck: bySeverity.high,
      recommendedCheck: bySeverity.medium + bySeverity.low,
      forReference: bySeverity.info,
      bySeverity,
      byCategory,
    },
  }
}
