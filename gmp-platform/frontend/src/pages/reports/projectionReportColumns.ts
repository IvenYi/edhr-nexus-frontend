export interface ReportColumn { id: string; label: string; width: number }
const columns = (items: string[][]): ReportColumn[] => items.map(([id, label]) => ({ id, label, width: /Time|Date|At/.test(id) ? 190 : 160 }));
const context = [['workOrderNo', '工单编号'], ['objectNo', '所属生产批次/SN'], ['productCode', '生产产品编码'], ['productName', '生产产品名称'], ['operationName', '工序']];
const material = [['materialCode', '物料编码'], ['materialName', '物料名称'], ['materialLotText', '物料批号']];
export const businessAttributeNames: Record<string, string> = {
  workHours: '投入工时（人时）', reportStartTime: '报工开始时间', reportEndTime: '报工结束时间', productionDate: '生产日期', reporter: '报工人',
};
export function businessRecordColumns(model: string) {
  return columns([...context, ...(model === 'production'
    ? [['outputQuantity', '产出数量'], ['goodQuantity', '良品数量'], ['ngQuantity', '不良品数量'], ['unit', '单位'], ...Object.entries(businessAttributeNames)]
    : [...material, ['quantity', model === 'scrap' ? '报废数量' : '消耗数量'], ['unit', '单位'], ['category', model === 'scrap' ? '报废分类' : '分类'], ['reason', model === 'scrap' ? '报废原因' : '原因']]),
    ['teamText', '责任班组'], ['documentNumberText', '关联单据号'], ['instanceNo', '来源表单'], ['location', '来源位置'],
    ['createdBy', '表单创建人'], ['createdAt', '表单创建时间'], ['updatedBy', '表单更新人'], ['updatedAt', '表单更新时间']]);
}
export function businessTotalColumns(model: string) {
  return columns([['objectNo', '所属生产批次/SN'], ['operationName', '工序'], ...(model === 'production'
    ? [['unit', '单位'], ['outputQuantity', '产出数量'], ['goodQuantity', '良品数量'], ['ngQuantity', '不良品数量'], ['workHours', '投入工时（人时）']]
    : [['materialName', '物料'], ['materialLot', '物料批号'], ['unit', '单位'], ['quantity', model === 'scrap' ? '报废数量' : '消耗数量']]), ['recordCount', '明细数']]);
}
export function businessFilters(model: string): string[][] {
  return [['workOrderNo', '工单编号'], ['productCode', '生产产品编码'], ['productName', '生产产品名称'], ['unit', '单位'], ['teamText', '责任班组'], ['documentNumberText', '关联单据号'],
    ...(model === 'production' ? [['reporter', '报工人'], ['productionDateFrom', '生产日期自'], ['productionDateTo', '生产日期至']]
      : [['materialCode', '物料编码'], ['materialName', '物料名称'], ['materialLotText', '物料批号'], ['category', model === 'scrap' ? '报废分类' : '分类'], ['reason', model === 'scrap' ? '报废原因' : '原因']]),
    ['createdBy', '表单创建人'], ['createdDateFrom', '表单创建日期自'], ['createdDateTo', '表单创建日期至'],
    ['updatedBy', '表单更新人'], ['updatedDateFrom', '表单更新日期自'], ['updatedDateTo', '表单更新日期至']];
}
export const isReportDateFilter = (id: string) => /Date(From|To)$/.test(id);
export function reportAttributeValue(attributes: Record<string, unknown>, key: string) {
  const value = attributes[key];
  if (['reportStartTime', 'reportEndTime'].includes(key) && typeof value === 'string') return value.replace('T', ' ');
  const label = attributes[`${key}Label`];
  return label && label !== value ? `${label}（${value}）` : value;
}
export function businessRecordValues(row: { attributes: Record<string, unknown>; context?: Record<string, unknown> }) {
  const attrs = row.attributes;
  const mat = attrs.material as { code?: string; name?: string } | undefined;
  return { ...row.context, ...row, ...Object.fromEntries(Object.keys(attrs).map(key => [key, reportAttributeValue(attrs, key)])),
    materialCode: mat?.code, materialName: mat?.name, unit: attrs.unit ? reportAttributeValue(attrs, 'unit') : '单位未填写' };
}
