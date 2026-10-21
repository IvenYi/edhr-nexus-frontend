import type { ReferenceValue } from './referenceConfig';

export const referenceSourceFields: Record<string, Array<{ value: string; label: string }>> = {
  user: [{ value: 'username', label: '账号' }, { value: 'displayName', label: '姓名' }, { value: 'phone', label: '手机号' }, { value: 'email', label: '邮箱' }],
  department: [{ value: 'code', label: '编码' }, { value: 'name', label: '名称' }, { value: 'parentName', label: '上级部门' }],
  material: [{ value: 'code', label: '编码' }, { value: 'name', label: '名称' }, { value: 'specification', label: '规格' }, { value: 'unit', label: '单位' }],
  product: [{ value: 'code', label: '编码' }, { value: 'name', label: '名称' }, { value: 'specification', label: '规格' }, { value: 'unit', label: '单位' }],
  equipment: [{ value: 'code', label: '编码' }, { value: 'name', label: '名称' }, { value: 'model', label: '型号' }],
  productionBatch: [{ value: 'code', label: '批次号' }, { value: 'workOrderNo', label: '工单号' }, { value: 'productCode', label: '产品编码' }, { value: 'productName', label: '产品名称' }],
  serialNumber: [{ value: 'code', label: 'SN' }, { value: 'workOrderNo', label: '工单号' }, { value: 'productCode', label: '产品编码' }, { value: 'productName', label: '产品名称' }],
  productionObject: [{ value: 'code', label: '批次/SN' }, { value: 'objectTypeName', label: '类型' }, { value: 'workOrderNo', label: '工单号' }, { value: 'productCode', label: '产品编码' }, { value: 'productName', label: '产品名称' }],
  workOrder: [{ value: 'code', label: '工单号' }, { value: 'productCode', label: '产品编码' }, { value: 'productName', label: '产品名称' }],
  operation: [{ value: 'code', label: '编码' }, { value: 'name', label: '名称' }],
  dictionary: [{ value: 'code', label: '字典编码' }, { value: 'name', label: '名称' }, { value: 'value', label: '值' }],
  defectReason: [{ value: 'code', label: '编号' }, { value: 'name', label: '不良原因' }, { value: 'description', label: '说明' }],
  scrapReason: [{ value: 'code', label: '编号' }, { value: 'name', label: '报废原因' }, { value: 'description', label: '说明' }],
};

export const contextReferenceSources = ['productionBatch', 'serialNumber', 'productionObject', 'workOrder', 'product', 'operation'];
export const tableReferenceSources = ['productionBatch', 'serialNumber', 'productionObject', 'workOrder', 'equipment', 'product', 'material', 'defectReason', 'scrapReason'];

export function referenceFields(config: Record<string, unknown>) {
  const source = String(config.sourceType ?? 'dictionary');
  const fields = referenceSourceFields[source] ?? [];
  return source === 'material' && 'referenceMaterialScope' in config
    ? [...fields, { value: 'materialTypeName', label: '物料类型' }] : fields;
}

export function supportsReferenceContext(config: Record<string, unknown>) {
  return contextReferenceSources.includes(String(config.sourceType))
    || config.sourceType === 'material' && config.referenceMaterialScope === 'product';
}

/** Group legacy aliases without rewriting their saved configuration. */
export function referenceEditorSource(source: string) {
  return source === 'product' ? 'material' : ['productionBatch', 'serialNumber'].includes(source) ? 'productionObject' : source;
}

export function referenceMaterialScope(config: Record<string, unknown>) {
  return config.sourceType === 'product' ? 'product' : String(config.referenceMaterialScope ?? 'all');
}

export function referenceProductionScope(config: Record<string, unknown>) {
  return config.sourceType === 'productionBatch' ? 'batch' : config.sourceType === 'serialNumber' ? 'sn' : String(config.referenceProductionScope ?? 'all');
}

export function referenceDisplayFields(config: Record<string, unknown>): string[] {
  if (Array.isArray(config.referenceDisplayFields) && config.referenceDisplayFields.length) return [...new Set(config.referenceDisplayFields.filter((key): key is string => typeof key === 'string'))];
  if (typeof config.referenceField === 'string' && config.referenceField) return [config.referenceField];
  const source = String(config.sourceType ?? 'dictionary');
  return [source === 'user' ? 'displayName' : ['productionBatch', 'serialNumber', 'productionObject', 'workOrder'].includes(source) ? 'code' : 'name'];
}

export function referenceDisplayText(value: ReferenceValue | null | undefined, config: Record<string, unknown>): string {
  if (!value?.id) return '';
  const parts = referenceDisplayFields(config).map(key => {
    const raw = value[key] ?? (key === 'displayName' ? value.name : undefined);
    return raw == null || typeof raw === 'object' ? '' : String(raw).trim();
  }).filter(text => text !== '');
  // Older saved references retain their captured label when expanded attributes are absent.
  return parts.length ? parts[0] + parts.slice(1).map(text => `[${text}]`).join('') : value.name;
}

export function referenceDefaultSearchFields(source: string): string[] {
  return source === 'user' ? ['username', 'displayName'] : ['productionBatch', 'serialNumber', 'productionObject', 'workOrder'].includes(source) ? ['code'] : source === 'dictionary' ? ['name', 'value'] : ['code', 'name'];
}
