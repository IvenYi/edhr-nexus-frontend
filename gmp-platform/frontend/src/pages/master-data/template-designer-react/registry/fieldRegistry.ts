import type { FieldTypeDefinition, ModelField, PropertySchemaItem } from '../types';

const BASE_FIELD_SCHEMA: PropertySchemaItem[] = [
  { key: 'name', label: '字段名称', editor: 'text', defaultValue: '' },
  { key: 'code', label: '字段编码', editor: 'text', defaultValue: '' },
  { key: 'placeholder', label: '占位文案', editor: 'text', defaultValue: '' },
  { key: 'required', label: '必填', editor: 'switch', defaultValue: false },
  { key: 'readonly', label: '只读', editor: 'switch', defaultValue: false },
  { key: 'hidden', label: '隐藏', editor: 'switch', defaultValue: false },
];

const OPTION_FIELD_SCHEMA: PropertySchemaItem[] = [
  ...BASE_FIELD_SCHEMA,
  { key: 'optionsText', label: '选项配置', editor: 'textarea', defaultValue: '选项1:option1\n选项2:option2' },
];

function buildField(type: string, name: string): ModelField {
  return {
    id: '',
    code: '',
    name,
    type,
    required: false,
    readonly: false,
    hidden: false,
    placeholder: '',
    optionsText: '',
    options: [],
    config: {},
  };
}

function createFieldDefinition(
  type: string,
  label: string,
  configSchema: PropertySchemaItem[] = BASE_FIELD_SCHEMA,
): FieldTypeDefinition {
  return {
    type,
    label,
    compatibleComponents: [type],
    defaultField: () => buildField(type, label),
    configSchema,
  };
}

export const fieldRegistry: FieldTypeDefinition[] = [
  createFieldDefinition('input', '单行文本'),
  createFieldDefinition('textarea', '多行文本'),
  createFieldDefinition('inputnumber', '整数'),
  createFieldDefinition('inputdouble', '小数'),
  createFieldDefinition('radio', '单选', OPTION_FIELD_SCHEMA),
  createFieldDefinition('checkbox', '复选', OPTION_FIELD_SCHEMA),
  createFieldDefinition('select', '下拉', OPTION_FIELD_SCHEMA),
  createFieldDefinition('switch', '开关'),
  createFieldDefinition('datepicker', '日期'),
  createFieldDefinition('datetimepicker', '日期时间'),
  createFieldDefinition('timepicker', '时间'),
  createFieldDefinition('userpicker', '人员'),
  createFieldDefinition('department', '部门'),
  createFieldDefinition('sub-table', '子表'),
  createFieldDefinition('readonlycmp', '只读文本'),
];

export function getFieldTypeDefinition(type: string) {
  return fieldRegistry.find((field) => field.type === type) ?? fieldRegistry[0];
}
