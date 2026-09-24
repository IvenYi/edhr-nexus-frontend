import type { DhrDisplayStatus, DhrObjectType, DhrProductionStatus } from '@/api/dhr-instances';

export const dhrObjectTypeLabel: Record<DhrObjectType, string> = { BATCH: '批次', SN: 'SN' };

export const dhrProductionStatusPresentation = {
  CREATED: { label: '已创建', color: 'info' },
  IN_PROGRESS: { label: '生产中', color: 'warning' },
  COMPLETED: { label: '已完成', color: 'success' },
  EARLY_TERMINATED: { label: '提前结束', color: 'error' },
  CANCELLED: { label: '已取消', color: 'error' },
} as const satisfies Record<DhrProductionStatus, { label: string; color: 'info' | 'warning' | 'success' | 'error' }>;

export const dhrProductionStatusFilters = (['IN_PROGRESS', 'COMPLETED', 'EARLY_TERMINATED'] as const).map(value => ({
  value,
  label: dhrProductionStatusPresentation[value].label,
}));

export function dhrProductionStatusMeta(status: string | null) {
  return status && status in dhrProductionStatusPresentation
    ? dhrProductionStatusPresentation[status as DhrProductionStatus]
    : undefined;
}

export const dhrStatusPresentation = {
  FILLING: { label: '填报中', color: 'warning' },
  PENDING_SUMMARY: { label: '待汇总', color: 'info' },
  SUMMARIZING: { label: '汇总中', color: 'primary' },
  PENDING_REVIEW: { label: '待审核', color: 'warning' },
  FINALIZED: { label: '已完成', color: 'success' },
  TERMINATED: { label: '已终止', color: 'error' },
  STATUS_ERROR: { label: '状态异常', color: 'error' },
} as const satisfies Record<DhrDisplayStatus, { label: string; color: 'warning' | 'info' | 'primary' | 'success' | 'error' }>;

export const dhrStatusFilters = (['FILLING', 'PENDING_SUMMARY', 'SUMMARIZING', 'PENDING_REVIEW', 'FINALIZED', 'TERMINATED'] as const)
  .map(value => ({ value, label: dhrStatusPresentation[value].label }));

export function dhrStatusMeta(status: DhrDisplayStatus) {
  return dhrStatusPresentation[status] ?? dhrStatusPresentation.STATUS_ERROR;
}
