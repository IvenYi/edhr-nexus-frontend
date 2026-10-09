import type { ExecutionView } from '@/api/production-execution';

const categories = [
  { id: 'operation', label: '操作记录', actions: ['工序开工', '工序完工'] },
  { id: 'work', label: '作业记录', actions: ['作业确认'] },
  { id: 'form', label: '填报记录', actions: ['保存表单', '提交表单', '审批表单', '退回表单', '表单字段签名', '新增表单份', '修改表单份备注', '结束表单填报'] },
];

export function executionHistoryGroups(history: ExecutionView['state']['history'], operationId: string) {
  const entries = history.filter(entry => entry.operationId === operationId).slice().reverse();
  const groups = categories.map(category => ({ id: category.id, label: category.label, entries: entries.filter(entry => category.actions.includes(entry.action)) }));
  const other = entries.filter(entry => !categories.some(category => category.actions.includes(entry.action)));
  if (other.length) groups.push({ id: 'other', label: '其他记录', entries: other });
  return groups;
}

export function executionFormReceipt(history: ExecutionView['state']['history'], operationId: string, formId: string, copyId: string, savedAt?: string) {
  const labels: Record<string, string> = { SAVE: '已暂存', SUBMIT: '已提交', APPROVE: '已审批', RETURN: '已退回', SIGN_FIELD: '已签名' };
  for (let index = history.length - 1; index >= 0; index--) {
    const entry = history[index];
    if (entry.operationId === operationId && entry.formId === formId && entry.copyId === copyId && labels[entry.actionCode ?? '']) {
      return { label: labels[entry.actionCode!], at: entry.at };
    }
  }
  return savedAt ? { label: '已保存', at: savedAt } : null;
}
