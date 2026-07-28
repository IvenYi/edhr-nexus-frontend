import type { FieldType, FieldTypeDefinition, FieldTypeIconKey, ModelField, PropertySchemaItem } from '../types';

const emptyTypeConfig = {};

const TEXT_TYPE_CONFIG_SCHEMA: PropertySchemaItem[] = [
  {
    key: 'textMode',
    label: '文本结构',
    editor: 'select',
    defaultValue: 'short',
    options: [
      { label: '短文本', value: 'short' },
      { label: '长文本', value: 'long' },
    ],
  },
];

const NUMBER_TYPE_CONFIG_SCHEMA: PropertySchemaItem[] = [
  {
    key: 'numberMode',
    label: '数字结构',
    editor: 'select',
    defaultValue: 'decimal',
    options: [
      { label: '整数', value: 'integer' },
      { label: '小数', value: 'decimal' },
    ],
  },
  { key: 'precision', label: '精度', editor: 'number', defaultValue: 2 },
  { key: 'unit', label: '单位', editor: 'text', defaultValue: '' },
];

const DATETIME_TYPE_CONFIG_SCHEMA: PropertySchemaItem[] = [
  {
    key: 'mode',
    label: '时间结构',
    editor: 'select',
    defaultValue: 'datetime',
    options: [
      { label: '日期', value: 'date' },
      { label: '时间', value: 'time' },
      { label: '日期时间', value: 'datetime' },
    ],
  },
  {
    key: 'precision',
    label: '时间精度',
    editor: 'select',
    defaultValue: 'second',
    options: [
      { label: '分钟', value: 'minute' },
      { label: '秒', value: 'second' },
    ],
  },
];

const SIGNATURE_TYPE_CONFIG_SCHEMA: PropertySchemaItem[] = [
  {
    key: 'signatureMode',
    label: '签署方式',
    editor: 'select',
    defaultValue: 'electronic',
    options: [
      { label: '电子签名', value: 'electronic' },
      { label: '手写签名', value: 'manual' },
      { label: '密码确认', value: 'password' },
      { label: '混合', value: 'mixed' },
    ],
  },
];

const ATTACHMENT_TYPE_CONFIG_SCHEMA: PropertySchemaItem[] = [
  { key: 'allowedFileTypes', label: '允许文件类型', editor: 'text', defaultValue: '' },
];

const IMAGE_TYPE_CONFIG_SCHEMA: PropertySchemaItem[] = [
  {
    key: 'allowedSources',
    label: '图片来源',
    editor: 'select',
    defaultValue: 'upload',
    options: [
      { label: '上传', value: 'upload' },
      { label: '拍照', value: 'camera' },
      { label: '上传或拍照', value: 'upload,camera' },
    ],
  },
];

const OPTION_TYPE_CONFIG_SCHEMA: PropertySchemaItem[] = [
  { key: 'options', label: '选项', editor: 'textarea', defaultValue: '选项1:option1\n选项2:option2' },
];

const REFERENCE_TYPE_CONFIG_SCHEMA: PropertySchemaItem[] = [
  {
    key: 'sourceType',
    label: '需要引用的功能数据',
    editor: 'select',
    defaultValue: 'dictionary',
    options: [
      { label: '人员', value: 'user' },
      { label: '部门', value: 'department' },
      { label: '物料', value: 'material' },
      { label: '设备', value: 'equipment' },
      { label: '产品', value: 'product' },
      { label: '供应商', value: 'supplier' },
      { label: '字典', value: 'dictionary' },
    ],
  },
];

const SUB_TABLE_TYPE_CONFIG_SCHEMA: PropertySchemaItem[] = [
  { key: 'columns', label: '子字段结构', editor: 'textarea', defaultValue: '' },
];

function createField(
  type: FieldType,
  name: string,
  typeConfig: Record<string, unknown>,
  sortOrder = 0,
): ModelField {
  return {
    id: '',
    code: '',
    name,
    type,
    groupId: 'default-group',
    sortOrder,
    status: 'enabled',
    description: '',
    typeConfig: { ...typeConfig },
  };
}

function createFieldDefinition(params: {
  type: FieldType;
  label: string;
  iconKey: FieldTypeIconKey;
  defaultComponentType: string;
  compatibleComponents: string[];
  typeConfig: Record<string, unknown>;
  typeConfigSchema: PropertySchemaItem[];
}): FieldTypeDefinition {
  return {
    type: params.type,
    label: params.label,
    iconKey: params.iconKey,
    defaultComponentType: params.defaultComponentType,
    compatibleComponents: params.compatibleComponents,
    defaultField: (name = params.label, sortOrder = 0) => createField(params.type, name, params.typeConfig, sortOrder),
    typeConfigSchema: params.typeConfigSchema,
  };
}

export const fieldRegistry: FieldTypeDefinition[] = [
  createFieldDefinition({
    type: 'text',
    label: '文本',
    iconKey: 'text',
    defaultComponentType: 'input',
    compatibleComponents: ['input', 'textarea', 'readonlycmp'],
    typeConfig: { textMode: 'short' },
    typeConfigSchema: TEXT_TYPE_CONFIG_SCHEMA,
  }),
  createFieldDefinition({
    type: 'number',
    label: '数字',
    iconKey: 'number',
    defaultComponentType: 'inputnumber',
    compatibleComponents: ['inputnumber', 'inputdouble', 'readonlycmp'],
    typeConfig: { numberMode: 'decimal', precision: 2, unit: '' },
    typeConfigSchema: NUMBER_TYPE_CONFIG_SCHEMA,
  }),
  createFieldDefinition({
    type: 'datetime',
    label: '日期时间',
    iconKey: 'datetime',
    defaultComponentType: 'datetimepicker',
    compatibleComponents: ['datepicker', 'datetimepicker', 'timepicker', 'readonlycmp'],
    typeConfig: { mode: 'datetime', precision: 'second' },
    typeConfigSchema: DATETIME_TYPE_CONFIG_SCHEMA,
  }),
  createFieldDefinition({
    type: 'signature',
    label: '签名',
    iconKey: 'signature',
    defaultComponentType: 'readonlycmp',
    compatibleComponents: ['readonlycmp', 'userpicker'],
    typeConfig: { signatureMode: 'electronic' },
    typeConfigSchema: SIGNATURE_TYPE_CONFIG_SCHEMA,
  }),
  createFieldDefinition({
    type: 'attachment',
    label: '附件',
    iconKey: 'attachment',
    defaultComponentType: 'readonlycmp',
    compatibleComponents: ['readonlycmp'],
    typeConfig: { allowedFileTypes: '' },
    typeConfigSchema: ATTACHMENT_TYPE_CONFIG_SCHEMA,
  }),
  createFieldDefinition({
    type: 'image',
    label: '图片',
    iconKey: 'image',
    defaultComponentType: 'readonlycmp',
    compatibleComponents: ['readonlycmp'],
    typeConfig: { allowedSources: 'upload' },
    typeConfigSchema: IMAGE_TYPE_CONFIG_SCHEMA,
  }),
  createFieldDefinition({
    type: 'singleSelect',
    label: '单选',
    iconKey: 'singleSelect',
    defaultComponentType: 'radio',
    compatibleComponents: ['radio', 'select', 'switch', 'readonlycmp'],
    typeConfig: { options: [] },
    typeConfigSchema: OPTION_TYPE_CONFIG_SCHEMA,
  }),
  createFieldDefinition({
    type: 'multiSelect',
    label: '多选',
    iconKey: 'multiSelect',
    defaultComponentType: 'checkbox',
    compatibleComponents: ['checkbox', 'readonlycmp'],
    typeConfig: { options: [] },
    typeConfigSchema: OPTION_TYPE_CONFIG_SCHEMA,
  }),
  createFieldDefinition({
    type: 'reference',
    label: '引用',
    iconKey: 'reference',
    defaultComponentType: 'userpicker',
    compatibleComponents: ['userpicker', 'department', 'select', 'readonlycmp'],
    typeConfig: {
      sourceType: 'dictionary',
    },
    typeConfigSchema: REFERENCE_TYPE_CONFIG_SCHEMA,
  }),
  createFieldDefinition({
    type: 'subTable',
    label: '子表',
    iconKey: 'subTable',
    defaultComponentType: 'sub-table',
    compatibleComponents: ['sub-table'],
    typeConfig: { columns: [] },
    typeConfigSchema: SUB_TABLE_TYPE_CONFIG_SCHEMA,
  }),
];

export function getFieldTypeDefinition(type: string) {
  return fieldRegistry.find((field) => field.type === type) ?? fieldRegistry[0];
}

export function createFallbackField(name: string, sortOrder = 0): ModelField {
  return createField('text', name, emptyTypeConfig, sortOrder);
}
