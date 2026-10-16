import type { ProductionOutput } from '@/api/work-orders';

type Source = NonNullable<ProductionOutput['sources']>[number];
export interface QuantitySourceRow { saved?: Source; effective?: Source }

// Copy identity is scoped by the operation passed by the caller. Never match by label or amount.
const sourceKey = (source: Source) => source.copyId && source.bindingId && source.rowKey && source.fieldId
  ? JSON.stringify([source.copyId, source.bindingId, source.tableId || '', source.rowKey, source.fieldId]) : undefined;

export function quantitySourceRows(output?: ProductionOutput, savedOutput?: ProductionOutput): QuantitySourceRow[] {
  const rows: QuantitySourceRow[] = (output?.sources ?? []).map(effective => ({ effective }));
  const matched = new Set<QuantitySourceRow>();
  for (const saved of savedOutput?.sources ?? []) {
    const key = sourceKey(saved);
    const row = key ? rows.find(candidate => !matched.has(candidate) && candidate.effective && sourceKey(candidate.effective) === key) : undefined;
    if (row) { row.saved = saved; matched.add(row); }
    else rows.push({ saved });
  }
  return rows;
}

export function quantitySourceStatus({ effective }: QuantitySourceRow): string {
  if (!effective) return '未生效';
  if (effective.projectionStatus === 'FAILED') return '处理失败';
  if (effective.projectionStatus && effective.projectionStatus !== 'SUCCEEDED') return '待处理';
  return effective.included ? '已生效' : '待核对';
}

export function quantityText(output?: ProductionOutput): string {
  if (output?.quantity != null) return `${output.quantity} ${output.unit || '（单位未填写）'}`;
  return (output?.groups?.length ?? 0) > 1 ? `${output!.groups!.length} 组（分物料/单位）` : '—';
}
