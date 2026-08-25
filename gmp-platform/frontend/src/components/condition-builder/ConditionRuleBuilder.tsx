import { Add, ChevronRight, DeleteOutline, ExpandMore, RemoveCircleOutline } from '@mui/icons-material';
import { Box, Button, Collapse, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';

export type ConditionScalar = string | number | boolean | null;
export type ConditionValue = ConditionScalar | ConditionScalar[];

export type ConditionClause = {
  fact: string;
  operator: string;
  value: ConditionValue;
};

export type ConditionExpression =
  | ConditionClause
  | { all: ConditionExpression[] }
  | { any: ConditionExpression[] }
  | { not: ConditionExpression };

export type ConditionFieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'multi-enum';

export type ConditionOperator = {
  id: string;
  label: string;
  valueKind: 'scalar' | 'list' | 'none';
};

export type ConditionField = {
  id: string;
  label: string;
  type: ConditionFieldType;
  group?: string;
  description?: string;
  options?: readonly { value: ConditionScalar; label: string }[];
};

export type ConditionValueEditorProps = {
  field: ConditionField;
  operator: ConditionOperator;
  value: ConditionValue;
  onChange: (value: ConditionValue) => void;
  disabled: boolean;
};

export type ConditionRuleAdapter = {
  fieldCatalogVersion: string;
  fields: readonly ConditionField[];
  getField: (fieldId: string) => ConditionField | undefined;
  getOperators: (field: ConditionField) => readonly ConditionOperator[];
  getDefaultValue: (field: ConditionField, operator: ConditionOperator) => ConditionValue;
  renderValue: (props: ConditionValueEditorProps) => ReactNode;
  formatValue?: (field: ConditionField, operator: ConditionOperator, value: ConditionValue) => string;
  validateClause?: (clause: ConditionClause, field: ConditionField, operator: ConditionOperator) => string | null;
};

function isGroup(expression: ConditionExpression): expression is { all: ConditionExpression[] } | { any: ConditionExpression[] } | { not: ConditionExpression } {
  return 'all' in expression || 'any' in expression || 'not' in expression;
}

function groupKind(expression: ConditionExpression): 'all' | 'any' | 'not' | null {
  if ('all' in expression) return 'all';
  if ('any' in expression) return 'any';
  if ('not' in expression) return 'not';
  return null;
}

function createClause(adapter: ConditionRuleAdapter): ConditionClause | null {
  const field = adapter.fields[0];
  if (!field) return null;
  const operator = adapter.getOperators(field)[0];
  if (!operator) return null;
  return { fact: field.id, operator: operator.id, value: adapter.getDefaultValue(field, operator) };
}

function expressionChildren(expression: ConditionExpression): ConditionExpression[] {
  if ('all' in expression) return expression.all;
  if ('any' in expression) return expression.any;
  if ('not' in expression) return [expression.not];
  return [];
}

function replaceGroupKind(expression: ConditionExpression, kind: 'all' | 'any' | 'not'): ConditionExpression {
  const children = expressionChildren(expression);
  if (kind === 'not') return { not: children[0] ?? { all: [] } };
  return { [kind]: children.length > 0 ? children : [] } as ConditionExpression;
}

function formatClause(adapter: ConditionRuleAdapter, clause: ConditionClause): string {
  const field = adapter.getField(clause.fact);
  if (!field) return clause.fact || '未选择字段';
  const operator = adapter.getOperators(field).find((item) => item.id === clause.operator);
  if (!operator) return field.label;
  const value = adapter.formatValue?.(field, operator, clause.value);
  return `${field.label} ${operator.label}${value ? ` ${value}` : ''}`;
}

export function countConditionClauses(expression: ConditionExpression | null | undefined): number {
  if (!expression) return 0;
  if (!isGroup(expression)) return 1;
  return expressionChildren(expression).reduce((count, child) => count + countConditionClauses(child), 0);
}

export function summarizeConditionExpression(expression: ConditionExpression | null | undefined, adapter: ConditionRuleAdapter): string {
  if (!expression) return '未配置条件';
  if (!isGroup(expression)) return formatClause(adapter, expression);
  if ('not' in expression) return `非（${summarizeConditionExpression(expression.not, adapter)}）`;
  const children = expressionChildren(expression).map((child) => summarizeConditionExpression(child, adapter));
  return `（${children.join(' ' + (groupKind(expression) === 'all' ? '且' : '或') + ' ')}）`;
}

function ClauseEditor({ expression, adapter, readOnly, onChange, onRemove }: {
  expression: ConditionClause;
  adapter: ConditionRuleAdapter;
  readOnly: boolean;
  onChange: (expression: ConditionExpression) => void;
  onRemove?: () => void;
}) {
  const field = adapter.getField(expression.fact);
  const operators = field ? adapter.getOperators(field) : [];
  const operator = operators.find((item) => item.id === expression.operator) ?? operators[0];
  const error = field && operator ? adapter.validateClause?.(expression, field, operator) : null;
  return <Stack spacing={0.5} sx={{ p: 1, border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff' }}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
      <FormControl size="small" sx={{ minWidth: { md: 180 } }} disabled={readOnly || adapter.fields.length === 0}>
        <InputLabel>字段</InputLabel>
        <Select label="字段" value={field?.id ?? ''} onChange={(event) => {
          const nextField = adapter.getField(String(event.target.value));
          const nextOperator = nextField ? adapter.getOperators(nextField)[0] : undefined;
          if (nextField && nextOperator) onChange({ fact: nextField.id, operator: nextOperator.id, value: adapter.getDefaultValue(nextField, nextOperator) });
        }}>
          {adapter.fields.map((item) => <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { md: 150 } }} disabled={readOnly || !field}>
        <InputLabel>比较方式</InputLabel>
        <Select label="比较方式" value={operator?.id ?? ''} onChange={(event) => {
          if (!field) return;
          const nextOperator = adapter.getOperators(field).find((item) => item.id === event.target.value);
          if (nextOperator) onChange({ ...expression, operator: nextOperator.id, value: adapter.getDefaultValue(field, nextOperator) });
        }}>
          {operators.map((item) => <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>)}
        </Select>
      </FormControl>
      {field && operator ? <Box sx={{ flex: 1, minWidth: 0 }}>{adapter.renderValue({ field, operator, value: expression.value, onChange: (value) => onChange({ ...expression, value }), disabled: readOnly })}</Box> : <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>当前暂无可用字段</Typography>}
      {!readOnly && onRemove ? <IconButton size="small" aria-label="删除条件" onClick={onRemove}><DeleteOutline fontSize="small" /></IconButton> : null}
    </Stack>
    {error ? <Typography variant="caption" color="error" sx={{ pl: { md: 1 }, lineHeight: 1.4 }}>{error}</Typography> : null}
  </Stack>;
}

function ExpressionEditor({ expression, adapter, readOnly, depth, onChange, onRemove }: {
  expression: ConditionExpression;
  adapter: ConditionRuleAdapter;
  readOnly: boolean;
  depth: number;
  onChange: (expression: ConditionExpression) => void;
  onRemove?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  if (!isGroup(expression)) return <ClauseEditor expression={expression} adapter={adapter} readOnly={readOnly} onChange={onChange} onRemove={onRemove} />;
  const kind = groupKind(expression)!;
  const children = expressionChildren(expression);
  const canAdd = Boolean(createClause(adapter));
  const updateChildren = (nextChildren: ConditionExpression[]) => {
    if (kind === 'not') onChange({ not: nextChildren[0] ?? { all: [] } });
    else onChange({ [kind]: nextChildren } as ConditionExpression);
  };
  return <Box sx={{ p: 1.25, border: '1px solid #d9e2ec', borderRadius: 1, bgcolor: depth === 0 ? '#f8fafc' : '#fbfcfe' }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <IconButton
        size="small"
        aria-label={expanded ? '收起条件组' : '展开条件组'}
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        sx={{ color: '#7a8796' }}
      >
        {expanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
      </IconButton>
      <FormControl size="small" sx={{ minWidth: 116 }} disabled={readOnly}>
        <InputLabel>条件关系</InputLabel>
        <Select label="条件关系" value={kind} onChange={(event) => onChange(replaceGroupKind(expression, event.target.value as 'all' | 'any' | 'not'))}>
          <MenuItem value="all">全部满足（且）</MenuItem>
          <MenuItem value="any">任一满足（或）</MenuItem>
          <MenuItem value="not">不满足（非）</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>{kind === 'not' ? '以下条件不成立时命中' : '组内条件共同决定此分支是否满足'}</Typography>
      {!readOnly && onRemove ? <IconButton size="small" aria-label="删除条件组" onClick={onRemove}><RemoveCircleOutline fontSize="small" /></IconButton> : null}
    </Stack>
    <Collapse in={expanded}>
      <Stack spacing={0.75}>
        {children.map((child, index) => <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
          {kind !== 'not' ? <Typography variant="caption" sx={{ minWidth: 48, pt: 1.2, color: '#6b7785', fontWeight: 650 }}>
            {isGroup(child) ? `条件组 ${index + 1}` : `条件 ${index + 1}`}
          </Typography> : null}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <ExpressionEditor expression={child} adapter={adapter} readOnly={readOnly} depth={depth + 1} onChange={(next) => updateChildren(children.map((item, childIndex) => childIndex === index ? next : item))} onRemove={kind === 'not' ? undefined : () => updateChildren(children.filter((_, childIndex) => childIndex !== index))} />
          </Box>
        </Box>)}
      </Stack>
      {!readOnly && kind !== 'not' ? <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
        <Button size="small" startIcon={<Add />} disabled={!canAdd} onClick={() => { const clause = createClause(adapter); if (clause) updateChildren([...children, clause]); }}>添加条件</Button>
        <Button size="small" startIcon={<Add />} disabled={!canAdd || depth >= 4} onClick={() => { const clause = createClause(adapter); if (clause) updateChildren([...children, { all: [clause] }]); }}>添加条件组</Button>
      </Stack> : null}
    </Collapse>
  </Box>;
}

export function ConditionRuleBuilder({ value, adapter, readOnly = false, onChange }: {
  value: ConditionExpression | null | undefined;
  adapter: ConditionRuleAdapter;
  readOnly?: boolean;
  onChange?: (value: ConditionExpression | null) => void;
}) {
  const hasFields = adapter.fields.length > 0;
  if (!value) return <Box sx={{ p: 1.5, border: '1px dashed #c7d2df', borderRadius: 1, bgcolor: '#fbfcfe' }}>
    <Typography variant="body2" color="text.secondary">{readOnly ? '未配置条件规则' : hasFields ? '尚未配置条件规则' : '当前暂无可用条件字段'}</Typography>
    {!readOnly && hasFields ? <Button size="small" startIcon={<Add />} sx={{ mt: 1 }} onClick={() => { const clause = createClause(adapter); if (clause) onChange?.({ all: [clause] }); }}>添加条件</Button> : null}
  </Box>;
  return <Stack spacing={1}>
    <ExpressionEditor expression={value} adapter={adapter} readOnly={readOnly} depth={0} onChange={(next) => onChange?.(next)} onRemove={readOnly ? undefined : () => onChange?.(null)} />
    {!readOnly ? <Button size="small" color="error" startIcon={<DeleteOutline />} sx={{ alignSelf: 'flex-start' }} onClick={() => onChange?.(null)}>清空条件</Button> : null}
  </Stack>;
}
