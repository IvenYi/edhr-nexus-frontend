import type { DhrAuditEvent } from '@/api/dhr-instances';

const labels: Record<string, string> = {
  id: '标识', dhrId: 'DHR 标识', dhrNo: 'DHR 编号', productionObjectId: '生产对象标识',
  objectId: '生产对象标识', objectNo: '生产对象', objectType: '生产形态', workOrderId: '工单标识',
  status: '状态', completedAt: '生产完成时间', terminatedAt: '终止时间', reason: '原因',
  dhrTemplateVersionId: '批记录模板版本标识', revision: '草稿修订号', versionNo: '汇总版本号',
  versionId: '汇总版本标识', summaryVersionId: '汇总版本标识', sourceVersionId: '来源汇总版本标识', fromVersionId: '来源汇总版本标识', sourceScopeHash: '来源范围摘要', snapshotHash: '快照摘要',
  overlayDirectories: '自建目录', placements: '目录展示位置', key: '目录标识', parentKey: '上级目录',
  name: '名称', sortOrder: '排序', recordId: '表单实例标识', targetNodeKey: '归入位置',
  beforeNodeKey: '插入位置', displayOrder: '展示顺序', displayName: '展示名称',
  attachmentId: '附件标识', sha256: '文件摘要', sourceKind: '附件来源', purpose: '用途', active: '是否关联',
  scope: '导出范围', archiveSha256: '压缩包摘要', taskId: '审批任务标识', action: '操作', opinion: '意见',
  evidenceChanges: '证据变化', instanceNo: '实例编号', message: '说明',
  removedSummaryVersions: '已清理的开发期汇总', summaryStatus: '汇总状态', requiresFreshCheck: '需要重新核查',
  signatureId: '签名标识', signerId: '签署人标识', signerName: '签署人', signerAccount: '签署账号',
  sessionOperatorId: '会话操作人标识', reviewMode: '审批方式', reviewOutcome: '审批结果', outcome: '审批结果',
};
const enums: Record<string, string> = {
  IN_PROGRESS: '填报中', COMPLETED: '生产完成', EARLY_TERMINATED: '已终止',
  NOT_STARTED: '待汇总', DRAFT: '汇总中', PENDING_REVIEW: '待审批', FORMALIZED: '已定稿',
  APPROVED: '已通过', RETURNED: '已退回', REJECTED: '已退回',
  CREATE: '创建', UPDATE: '更新', SAVE: '保存', SUBMIT: '提交', APPROVE: '审批通过', RETURN: '退回',
  LINK: '关联附件', VERIFY: '核验附件', UNLINK: '解除附件关联', EXPORT: '导出', MIGRATE: '数据迁移',
  BATCH: '批次', SN: 'SN', NONE: '不另启汇总审批', REQUIRED: '需要汇总审批',
  FULL: '完整 DHR', SELECTED: '选定范围', EXTERNAL_REPORT: '委外报告', CERTIFICATE: '证明文件', PAPER_SCAN: '纸质扫描', OTHER: '其他',
};
const enumFields = new Set(['status', 'summaryStatus', 'objectType', 'action', 'reviewMode', 'reviewOutcome', 'outcome', 'scope', 'sourceKind']);
export const dhrAuditEntityLabels: Record<string, string> = {
  DHR_INSTANCE: 'DHR 生命周期', DHR_SUMMARY_DRAFT: '汇总目录', DHR_SUMMARY_VERSION: '汇总版本',
  DHR_SUMMARY_REVIEW: '汇总审批', DHR_SUMMARY_EXPORT: '档案导出', DHR_ATTACHMENT: '受控附件',
};
export function dhrAuditActionLabel(event: DhrAuditEvent) {
  if (event.entityType === 'DHR_ATTACHMENT') return enums[event.action] || '附件操作';
  return event.functionName ? enums[event.functionName] || event.functionName : enums[event.action] || '数据操作';
}
export function dhrDateTime(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 19) : '—';
}
function scalar(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (enumFields.has(key) && typeof value === 'string') return enums[value] || '未知状态';
  if (key.endsWith('At') && typeof value === 'string') return dhrDateTime(value);
  if (['targetNodeKey', 'parentKey', 'beforeNodeKey'].includes(key) && typeof value === 'string') {
    const sources: Record<string, string> = { 'source-work': '作业表单', 'source-custom': '自定义表单', 'source-directory': '未匹配目录表单' };
    return sources[value] || value.replace(/^base-dir-/, '基础目录 ').replace(/^base-item-/, '目录表单 ').replace(/^record-/, '表单实例 ');
  }
  return String(value);
}

/** Display-only projection: original audit snapshots are never rewritten. */
export function dhrAuditFields(snapshot: string | null): Array<{ key: string; label: string; value: string }> {
  if (!snapshot) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(snapshot); } catch { return [{ key: 'text', label: '记录内容', value: snapshot }]; }
  const fields: Array<{ key: string; label: string; value: string }> = [];
  const walk = (value: unknown, key: string, path: string, title: string) => {
    if (Array.isArray(value)) {
      if (!value.length) fields.push({ key: path, label: title, value: '无' });
      value.forEach((item, index) => walk(item, key, `${path}.${index}`, `${title} ${index + 1}`));
    } else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([child, item]) => walk(item, child, `${path}.${child}`, [title, labels[child] || '其他信息'].filter(Boolean).join(' / ')));
    } else if (value !== null || path) fields.push({ key: path, label: title || '记录内容', value: scalar(key, value) });
  };
  walk(parsed, '', '', '');
  return fields;
}
