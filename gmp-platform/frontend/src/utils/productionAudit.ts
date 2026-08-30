export interface ProductionAuditField {
  key: string;
  label: string;
  value: string;
}

const fieldLabels: Record<string, string> = {
  orderNo: '工单编号',
  objectNo: '生产对象编号',
  workOrderId: '来源工单ID',
  workOrderNo: '来源工单编号',
  orderNumber: '订单编号',
  productId: '产品ID',
  productName: '产品名称',
  productCode: '产品编码',
  processVersionId: '制程版本ID',
  processVersion: '制程版本',
  productionMode: '生产模式',
  productionForm: '生产形态',
  objectType: '生产形态',
  plannedQuantity: '计划数量',
  targetQuantity: '目标数量',
  goodQuantity: '良品数量',
  ngQuantity: 'NG数量',
  scrapQuantity: '报废数量',
  plannedStartAt: '计划开始时间',
  plannedEndAt: '计划结束时间',
  status: '状态',
  terminationReason: '结束原因',
  terminationAt: '结束时间',
  remark: '备注',
};

const fieldOrder = [
  'orderNo',
  'objectNo',
  'workOrderNo',
  'workOrderId',
  'orderNumber',
  'productName',
  'productCode',
  'productId',
  'processVersion',
  'processVersionId',
  'productionMode',
  'productionForm',
  'objectType',
  'plannedQuantity',
  'targetQuantity',
  'goodQuantity',
  'ngQuantity',
  'scrapQuantity',
  'plannedStartAt',
  'plannedEndAt',
  'status',
  'terminationReason',
  'terminationAt',
  'remark',
];

const statusLabels: Record<string, string> = {
  CREATED: '已创建',
  IN_PROCESS: '生产中',
  IN_PROGRESS: '生产中',
  COMPLETED: '已完成',
  CLOSED: '已关闭',
  EARLY_TERMINATED: '提前结束',
  CANCELLED: '已取消',
};

const productionFormLabels: Record<string, string> = {
  BATCH: '批次',
  SN: 'SN',
  '批次': '批次',
  '批次转SN': '批次转SN',
};

const dateTimeFields = new Set(['plannedStartAt', 'plannedEndAt', 'terminationAt']);

function parseSnapshot(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatDateTime(value: unknown): string {
  if (typeof value !== 'string') return String(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace('T', ' ').slice(0, 19);
  return date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  if (field === 'status' && typeof value === 'string') return statusLabels[value] || value;
  if ((field === 'productionForm' || field === 'objectType') && typeof value === 'string') return productionFormLabels[value] || value;
  if (dateTimeFields.has(field)) return formatDateTime(value);
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return JSON.stringify(value, null, 2);
}

export function toProductionAuditFields(
  value: unknown,
  labelOverrides: Record<string, string> = {},
): ProductionAuditField[] {
  const parsed = parseSnapshot(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return [];

  const orderByField = new Map(fieldOrder.map((field, index) => [field, index]));
  return Object.entries(parsed as Record<string, unknown>)
    .sort(([left], [right]) => (orderByField.get(left) ?? fieldOrder.length) - (orderByField.get(right) ?? fieldOrder.length))
    .map(([key, fieldValue]) => ({
      key,
      label: labelOverrides[key] || fieldLabels[key] || key,
      value: formatValue(key, fieldValue),
    }));
}
