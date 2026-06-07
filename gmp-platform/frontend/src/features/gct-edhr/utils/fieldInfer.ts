import type { EdhrFieldDataType, EdhrFieldMeta, EdhrPageMeta } from '../types';

const DEFAULT_STATUS_VALUES = ['草稿', '启用', '禁用', '已删除', '待处理', '处理中', '已完成'];
const DEFAULT_USER_VALUES = ['张工', '李工', '王主管', '赵审核', '陈管理员'];
const DEFAULT_SELECT_VALUES = ['标准', '加急', '常规', '复核', '归档'];
const BASE_TIME = Date.UTC(2026, 0, 5, 8, 0, 0);

export interface DeterministicMockValueOptions {
  page?: Pick<EdhrPageMeta, 'code' | 'title' | 'label' | 'baseStatuses' | 'businessStatuses'>;
  recordIndex: number;
  statusValues?: string[];
}

export function inferEdhrFieldType(field: Pick<EdhrFieldMeta, 'name' | 'label' | 'system'>): EdhrFieldDataType {
  const key = `${field.label} ${field.name}`.toLowerCase();

  if (field.name === 'status' || field.label === 'status') return 'status';
  if (field.name === 'createdBy' || field.name === 'updatedBy') return 'user';
  if (field.name === 'createdAt' || field.name === 'updatedAt') return 'datetime';
  if (field.name === 'remark') return 'textarea';
  if (field.name === 'id' || field.name === 'tenantId') return 'code';

  if (matchesAny(key, ['日期时间', '创建时间', '更新时间', '操作时间', '审核时间', '审批时间', '完成时间', '时间戳'])) {
    return 'datetime';
  }
  if (matchesAny(key, ['日期', '年月日', '生产日', '有效期', '到期日', '采样日', '检验日'])) {
    return 'date';
  }
  if (matchesAny(key, ['状态', 'status'])) {
    return 'status';
  }
  if (matchesAny(key, ['数量', '次数', '金额', '天数', '小时', '分钟', '比例', '百分比', '合格率', '不良率', '温度', '体积', '重量', '浓度', 'ph', '计数'])) {
    return 'number';
  }
  if (matchesAny(key, ['创建人', '更新人', '负责人', '操作人', '操作员', '审核人', '审批人', '复核人', '放行人', '申请人', '维护人', '管理员', '人员'])) {
    return 'user';
  }
  if (matchesAny(key, ['备注', '说明', '描述', '原因', '意见', '结论', '内容', '要求', '提示词', '场景', '边界', '标准'])) {
    return 'textarea';
  }
  if (matchesAny(key, ['编号', '编码', '代码', '单号', '批号', '批次', 'sn', 'lot', 'no', 'id', '条码', '流水号', '版本号', '工单'])) {
    return 'code';
  }
  if (matchesAny(key, ['类型', '类别', '分类', '等级', '级别', '模式', '方式', '模板', '规则', '角色', '权限', '来源'])) {
    return 'select';
  }

  return 'text';
}

export function createDeterministicMockValue(
  field: EdhrFieldMeta,
  options: DeterministicMockValueOptions,
): unknown {
  const fieldType = inferEdhrFieldType(field);
  const seed = stableHash(`${options.page?.code ?? 'gct'}:${field.id}:${field.label}:${options.recordIndex}`);
  const ordinal = options.recordIndex + 1;

  switch (fieldType) {
    case 'date':
      return formatDate(seed, ordinal);
    case 'datetime':
      return formatDateTime(seed, ordinal);
    case 'number':
      return createNumberValue(field.label, seed, ordinal);
    case 'status': {
      const statusValues = options.statusValues?.length
        ? options.statusValues
        : [...(options.page?.businessStatuses ?? []), ...(options.page?.baseStatuses ?? []), ...DEFAULT_STATUS_VALUES];
      return statusValues[Math.abs(seed + ordinal) % statusValues.length];
    }
    case 'user':
      return DEFAULT_USER_VALUES[Math.abs(seed + ordinal) % DEFAULT_USER_VALUES.length];
    case 'code':
      return createCodeValue(field.label, options.page?.code ?? 'gct', seed, ordinal);
    case 'textarea':
      return `${field.label}演示内容 ${ordinal}，用于前端联调和审计回放。`;
    case 'select':
      return createSelectMockValue(field.label, seed, ordinal);
    case 'text':
    default:
      return `${field.label} ${ordinal}`;
  }
}

export function createSelectMockValue(label: string, seed: number, ordinal: number): string {
  const options = getSelectOptions(label);
  return options[Math.abs(seed + ordinal) % options.length];
}

export function getSelectOptions(label: string): string[] {
  if (label.includes('记录')) return ['生产记录', '检验记录', '放行记录', '偏差记录'];
  if (label.includes('模板')) return ['批生产模板', '检验模板', '放行模板', '标签模板'];
  if (label.includes('权限') || label.includes('角色')) return ['管理员', '审核员', '操作员', '只读'];
  if (label.includes('等级') || label.includes('级别')) return ['高', '中', '低'];
  if (label.includes('方式') || label.includes('模式')) return ['自动', '手动', '半自动'];
  if (label.includes('类型') || label.includes('类别') || label.includes('分类')) return ['主数据', '事务', '报表', '流程'];
  return DEFAULT_SELECT_VALUES;
}

export function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function matchesAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle.toLowerCase()));
}

function formatDate(seed: number, ordinal: number): string {
  const timestamp = BASE_TIME + ((seed % 240) + ordinal) * 86_400_000;
  return new Date(timestamp).toISOString().slice(0, 10);
}

function formatDateTime(seed: number, ordinal: number): string {
  const timestamp = BASE_TIME + ((seed % 1_440) + ordinal * 37) * 60_000;
  return new Date(timestamp).toISOString();
}

function createNumberValue(label: string, seed: number, ordinal: number): number {
  if (label.includes('率') || label.includes('比例') || label.includes('百分比')) {
    return Number(((seed % 10_000) / 100).toFixed(2));
  }
  if (label.includes('温度')) {
    return Number((20 + (seed % 1_500) / 100).toFixed(2));
  }
  if (label.toLowerCase().includes('ph')) {
    return Number((6 + (seed % 250) / 100).toFixed(2));
  }
  return (seed % 900) + ordinal;
}

function createCodeValue(label: string, pageCode: string, seed: number, ordinal: number): string {
  const prefix = pageCode
    .replace(/^gct_/, 'GCT-')
    .replace(/_/g, '-')
    .toUpperCase();
  const suffix = String((seed % 10_000) + ordinal).padStart(4, '0');

  if (label.includes('批') || label.toLowerCase().includes('lot')) return `LOT-${suffix}`;
  if (label.toLowerCase().includes('sn')) return `SN-${suffix}`;
  if (label.includes('版本')) return `V${(seed % 5) + 1}.${ordinal % 10}`;
  if (label.includes('工单')) return `WO-${suffix}`;
  if (label.includes('流水')) return `SEQ-${suffix}`;
  return `${prefix}-${suffix}`;
}
