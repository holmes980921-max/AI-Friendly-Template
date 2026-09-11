// Simulates exactly what Excel puts on the clipboard when a vertically
// merged cell (제품명 = KKK) is copied: the value appears only on the first
// row of the merge; the other rows carry an empty cell for that column.
export const SAMPLE_TABLE_TSV = [
  '제품명\t조건\t설명',
  'KKK\t얇음\tA',
  '\t두꺼움\tB',
  '\t정상\tC',
].join('\n')
