import { describe, expect, it } from 'vitest'
import { detectTableInput } from './tableDetector'

describe('detectTableInput', () => {
  it('detects simple TSV pasted from Excel (spec case A)', () => {
    const text = '제품명\t조건\t설명\nKKK\t얇음\tA\n\t두꺼움\tB\n\t정상\tC'
    expect(detectTableInput(text)).toBe(true)
  })

  it('detects TSV with repeated header text (spec case B)', () => {
    const text = '상위 분류\t상위 분류\t조건\n공정 조건 및 판단 기준\t공정 조건 및 판단 기준\t얇음'
    expect(detectTableInput(text)).toBe(true)
  })

  it('does not treat a normal document with a single stray tab as a table', () => {
    const text = 'PR 공정 이상 발생 시 대응 가이드\n\nPR\t두께가 얇으면 문제가 발생할 수 있다.\n문제 발생 시 기존 조건으로 진행한다.'
    expect(detectTableInput(text)).toBe(false)
  })

  it('does not treat single-line input as a table', () => {
    expect(detectTableInput('제품명\t조건\t설명')).toBe(false)
  })

  it('does not treat normal multi-paragraph prose as a table', () => {
    const text = [
      'PR 두께가 얇으면 문제가 발생할 수 있다.',
      '문제 발생 시 기존 조건으로 진행하거나 담당자에게 문의한다.',
      '제품에 따라 조건은 다를 수 있다.',
    ].join('\n')
    expect(detectTableInput(text)).toBe(false)
  })
})
