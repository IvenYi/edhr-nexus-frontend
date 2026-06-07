import type { EdhrActionMeta, EdhrPageMeta } from '../types';

export type EdhrCloneMode = 'copy' | 'version';

export interface EdhrActionPolicy {
  code: string;
  auditRequired: boolean;
  readonly?: boolean;
  targetStatus?: string;
  cloneMode?: EdhrCloneMode;
  message: string;
}

const ACTION_LABELS: Record<string, string> = {
  query: '查询',
  reset: '重置',
  create: '新建',
  detail: '详情',
  edit: '编辑',
  delete: '删除',
  disable: '禁用',
  enable: '启用',
  copy: '复制',
  version_create: '创建版本',
  version_copy: '复制版本',
  process: '处理',
  finish: '完成',
  approve: '批准',
  reject: '驳回',
  release: '放行',
  withdraw: '撤回',
  transfer: '转交',
  reset_password: '重置密码',
  print: '打印',
  download: '下载',
  export: '导出',
  import: '导入',
  publish: '发布',
  unpublish: '取消发布',
  save: '保存',
  configure: '配置',
};

export const ACTION_POLICY_MAP: Record<string, EdhrActionPolicy> = {
  query: { code: 'query', auditRequired: false, readonly: true, message: '查询条件已应用' },
  reset: { code: 'reset', auditRequired: false, readonly: true, message: '查询条件已重置' },
  create: { code: 'create', auditRequired: true, targetStatus: '草稿', message: '记录已创建' },
  detail: { code: 'detail', auditRequired: false, readonly: true, message: '记录详情已打开' },
  edit: { code: 'edit', auditRequired: true, message: '记录已更新' },
  delete: { code: 'delete', auditRequired: true, targetStatus: '已删除', message: '记录已逻辑删除' },
  disable: { code: 'disable', auditRequired: true, targetStatus: '禁用', message: '记录已禁用' },
  enable: { code: 'enable', auditRequired: true, targetStatus: '启用', message: '记录已启用' },
  copy: { code: 'copy', auditRequired: true, targetStatus: '草稿', cloneMode: 'copy', message: '记录副本已创建' },
  version_create: {
    code: 'version_create',
    auditRequired: true,
    targetStatus: '草稿',
    cloneMode: 'version',
    message: '新版本已创建',
  },
  version_copy: {
    code: 'version_copy',
    auditRequired: true,
    targetStatus: '草稿',
    cloneMode: 'version',
    message: '版本副本已创建',
  },
  process: { code: 'process', auditRequired: true, targetStatus: '处理中', message: '记录已进入处理' },
  finish: { code: 'finish', auditRequired: true, targetStatus: '已完成', message: '记录已完成' },
  approve: { code: 'approve', auditRequired: true, targetStatus: '已完成', message: '审批已通过' },
  reject: { code: 'reject', auditRequired: true, targetStatus: '已驳回', message: '审批已驳回' },
  release: { code: 'release', auditRequired: true, targetStatus: '已完成', message: '记录已放行' },
  withdraw: { code: 'withdraw', auditRequired: true, targetStatus: '已撤回', message: '记录已撤回' },
  transfer: { code: 'transfer', auditRequired: true, targetStatus: '待处理', message: '记录已转交' },
  reset_password: { code: 'reset_password', auditRequired: true, targetStatus: '启用', message: '密码已重置' },
  print: { code: 'print', auditRequired: true, readonly: true, message: '打印任务已生成' },
  download: { code: 'download', auditRequired: true, readonly: true, message: '下载任务已生成' },
  export: { code: 'export', auditRequired: true, readonly: true, message: '导出任务已生成' },
  import: { code: 'import', auditRequired: true, message: '导入任务已记录' },
  publish: { code: 'publish', auditRequired: true, targetStatus: '启用', message: '记录已发布' },
  unpublish: { code: 'unpublish', auditRequired: true, targetStatus: '禁用', message: '记录已取消发布' },
  save: { code: 'save', auditRequired: true, targetStatus: '草稿', message: '记录已保存' },
  configure: { code: 'configure', auditRequired: true, message: '配置已保存' },
};

const FALLBACK_ACTIONS_BY_PAGE_TYPE: Partial<Record<EdhrPageMeta['type'], string[]>> = {
  execution: ['process', 'finish', 'detail'],
  approval: ['approve', 'reject', 'detail'],
  report: ['query', 'reset', 'export', 'download'],
  dashboard: ['query', 'reset', 'configure'],
};

export function getActionPolicy(actionCode: string): EdhrActionPolicy {
  const normalizedCode = normalizeActionCode(actionCode);
  const exactPolicy = ACTION_POLICY_MAP[actionCode] ?? ACTION_POLICY_MAP[normalizedCode];

  if (exactPolicy) {
    return { ...exactPolicy, code: actionCode };
  }

  return {
    code: actionCode,
    auditRequired: true,
    message: `${getActionLabel(actionCode)}已执行`,
  };
}

export function getDisplayActionsForPage(page: EdhrPageMeta): EdhrActionMeta[] {
  if (page.actions.length > 0) {
    return page.actions.map((action) => ({ ...action }));
  }

  const fallbackCodes = FALLBACK_ACTIONS_BY_PAGE_TYPE[page.type] ?? [];
  return fallbackCodes.map((code) => createFallbackAction(page, code));
}

export function getActionLabel(actionCode: string, action?: EdhrActionMeta): string {
  if (action?.label) return action.label;
  const normalizedCode = normalizeActionCode(actionCode);
  return ACTION_LABELS[actionCode] ?? ACTION_LABELS[normalizedCode] ?? actionCode;
}

export function getNextStatusForAction(actionCode: string, currentStatus: string, page: EdhrPageMeta): string {
  const policy = getActionPolicy(actionCode);
  const allowedStatuses = new Set([...page.baseStatuses, ...page.businessStatuses]);
  const targetStatus = policy.targetStatus;

  if (targetStatus && allowedStatuses.has(targetStatus)) {
    return targetStatus;
  }
  if (targetStatus && allowedStatuses.size === 0) {
    return targetStatus;
  }
  return currentStatus;
}

export function getInitialStatusForPage(page: EdhrPageMeta, recordIndex: number): string {
  const workflowStatuses = page.businessStatuses.filter((status) => status !== '已删除' && status !== '已作废');
  const baseStatuses = page.baseStatuses.filter((status) => status !== '已删除');
  const statusPool = workflowStatuses.length > 0 ? workflowStatuses : baseStatuses;

  if (statusPool.length === 0) return '草稿';
  return statusPool[recordIndex % statusPool.length];
}

export function isLogicalDeleteAction(actionCode: string): boolean {
  return normalizeActionCode(actionCode) === 'delete';
}

export function isLogicalDisableAction(actionCode: string): boolean {
  return normalizeActionCode(actionCode) === 'disable';
}

export function isLogicalEnableAction(actionCode: string): boolean {
  return normalizeActionCode(actionCode) === 'enable';
}

function normalizeActionCode(actionCode: string): string {
  if (actionCode in ACTION_POLICY_MAP) return actionCode;
  if (actionCode === 'add' || actionCode.startsWith('create_') || actionCode.startsWith('add_')) return 'create';
  if (actionCode.endsWith('_download') || actionCode === 'batch_download') return 'download';
  if (actionCode.endsWith('_export')) return 'export';
  if (actionCode.endsWith('_import') || actionCode === 'template_import' || actionCode === 'label_template_import') {
    return 'import';
  }
  if (actionCode.endsWith('_configure') || actionCode === 'workflow_configure' || actionCode === 'permission_configure') {
    return 'configure';
  }
  if (actionCode.endsWith('_detail') || actionCode === 'view' || actionCode === 'compare_version') return 'detail';
  if (actionCode === 'fill' || actionCode === 'inspect' || actionCode === 'forward') return 'process';
  if (actionCode === 'remove_and_transfer') return 'transfer';
  return actionCode;
}

function createFallbackAction(page: EdhrPageMeta, code: string): EdhrActionMeta {
  const policy = getActionPolicy(code);
  const label = getActionLabel(code);

  return {
    id: `fallback-${page.type}-${code}`,
    code,
    label,
    sourceLabel: label,
    permissionRequired: false,
    auditRequired: policy.auditRequired,
  };
}
