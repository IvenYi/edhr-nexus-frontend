// Paper regions transcribed from the three blank originals. No field types or bindings.
const cell = (source, range, hint) => ({ source, range, hint });
const clean = [
  cell('A4', 'C4:D4'), cell('E4', 'F4:G4'), cell('H4', 'I4:J4'), cell('A5', 'C5:D5'), cell('E5', 'F5:I5'),
  ...Array.from({ length: 8 }, (_, i) => cell('D' + (8 + i), 'F' + (8 + i) + ':I' + (8 + i))),
  cell('A19', 'C19:E19'), cell('F19', 'G19:I19'),
];
const scrap = [
  cell('A5', 'B5:E5'), cell('F5', 'G5:I5'), cell('A6', 'B6:E6'), cell('F6', 'G6:I6'), cell('A7', 'B7:E7'), cell('F7', 'G7:I7'),
  ...['报废原因', '申请人', '申请日期'].map(hint => cell('A8', 'inline', hint)),
  ...['批准', '管理者代表签字', '批准日期'].map(hint => cell('A9', 'inline', hint)),
  ...['报废处理结果', '报废后照片', '处理人', '处理日期', '财务确认', '财务确认日期'].map(hint => cell('A10', 'inline', hint)),
];
const clearance = [
  cell('A3', 'B3:E3'), cell('F3', 'G3:H3'),
  ...Array.from({ length: 8 }, (_, i) => cell('B' + (5 + i), 'H' + (5 + i))),
  cell('A14', 'C14:E14'), cell('F14', 'G14:H14'), cell('A35', 'C35:E35'), cell('F35', 'G35:H35'),
  ...'ABCDEFGH'.split('').map(col => ({ ...cell(col + '17', col + '18'), table: 'material_lines' })),
];

export function sourceRegions(sample) {
  const regions = { clean, scrap, 'line-clearance': clearance }[sample.id];
  if (!regions) throw new Error('No reviewed regions for sample');
  return regions.map((region, index) => ({ ...region, slot: 's' + (index + 1), text: sample.input.cells.find(cell => cell.address === region.source).text }));
}
