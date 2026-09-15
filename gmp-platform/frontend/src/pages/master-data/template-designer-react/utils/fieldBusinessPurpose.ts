import type { FieldType } from '../types';

export const fieldBusinessPurposeOptions = [
  { value: '', label: '普通字段（不参与产出统计）' },
  { value: 'PRODUCTION_GOOD', label: '良品数量' },
  { value: 'PRODUCTION_NG', label: '不良品数量' },
  { value: 'PRODUCTION_SCRAP', label: '报废数量' },
];

export function withFieldBusinessPurpose(type: FieldType, config: Record<string, unknown>, purpose: string) {
  const next = { ...config };
  if (type === 'number' && purpose && fieldBusinessPurposeOptions.some(option => option.value === purpose)) next.businessPurpose = purpose;
  else next.businessPurpose = '';
  return next;
}
