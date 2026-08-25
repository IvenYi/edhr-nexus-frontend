import { TextField } from '@mui/material';
import type { ConditionField, ConditionOperator, ConditionRuleAdapter, ConditionValue } from '@/components/condition-builder/ConditionRuleBuilder';

export const WORK_CONDITION_FIELD_CATALOG_VERSION = 'work-runtime-fields-v1';

export const WORK_CONDITION_FIELDS: readonly ConditionField[] = [
  { id: 'workType', label: '作业类型', type: 'string', group: '作业上下文' },
  { id: 'triggerType', label: '触发类型', type: 'string', group: '作业上下文' },
  { id: 'sourceType', label: '来源类型', type: 'string', group: '来源上下文' },
  { id: 'sourceNumber', label: '来源单号', type: 'string', group: '来源上下文' },
  { id: 'executionStatus', label: '执行状态', type: 'string', group: '执行上下文' },
];

const WORK_CONDITION_OPERATORS: readonly ConditionOperator[] = [
  { id: 'equals', label: '等于', valueKind: 'scalar' },
  { id: 'not-equals', label: '不等于', valueKind: 'scalar' },
  { id: 'contains', label: '包含', valueKind: 'scalar' },
  { id: 'starts-with', label: '以此开头', valueKind: 'scalar' },
  { id: 'in', label: '属于任一值', valueKind: 'list' },
  { id: 'is-present', label: '已填写', valueKind: 'none' },
  { id: 'is-null', label: '为空', valueKind: 'none' },
];

export const WORK_CONDITION_FIELD_SNAPSHOT: Record<string, string> = Object.fromEntries(
  WORK_CONDITION_FIELDS.map((field) => [field.id, field.type]),
);

function renderValue({ operator, value, onChange, disabled }: { operator: ConditionOperator; value: ConditionValue; onChange: (value: ConditionValue) => void; disabled: boolean }) {
  if (operator.valueKind === 'none') return null;
  const textValue = Array.isArray(value) ? value.join(', ') : value == null ? '' : String(value);
  return <TextField
    size="small"
    fullWidth
    disabled={disabled}
    label={operator.valueKind === 'list' ? '值（用逗号分隔）' : '值'}
    value={textValue}
    onChange={(event) => onChange(operator.valueKind === 'list' ? event.target.value.split(',').map((item) => item.trim()).filter(Boolean) : event.target.value)}
  />;
}

export const WORK_CONDITION_ADAPTER: ConditionRuleAdapter = {
  fieldCatalogVersion: WORK_CONDITION_FIELD_CATALOG_VERSION,
  fields: WORK_CONDITION_FIELDS,
  getField: (fieldId) => WORK_CONDITION_FIELDS.find((field) => field.id === fieldId),
  getOperators: () => WORK_CONDITION_OPERATORS,
  getDefaultValue: (_field, operator) => operator.valueKind === 'list' ? [] : operator.valueKind === 'none' ? null : '',
  renderValue,
  formatValue: (_field, operator, value) => operator.valueKind === 'none' ? '' : Array.isArray(value) ? value.join('、') : value == null ? '' : String(value),
  validateClause: (clause, _field, operator) => operator.valueKind !== 'none' && (Array.isArray(clause.value) ? clause.value.length === 0 : String(clause.value ?? '').trim() === '') ? '请输入条件值' : null,
};
