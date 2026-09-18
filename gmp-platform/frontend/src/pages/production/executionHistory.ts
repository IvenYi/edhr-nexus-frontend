import type { ExecutionView } from '@/api/production-execution';

const categories = [
  { id: 'operation', label: '操作记录', actions: ['工序开工', '工序完工'] },
  { id: 'work', label: '作业记录', actions: ['作业确认'] },
  { id: 'form', label: '填报记录', actions: ['保存表单', '提交表单', '审批表单', '退回表单', '表单字段签名', '新增表单份', '结束表单填报'] },
];

export function executionHistoryGroups(history: ExecutionView['state']['history'], operationId: string) {
  const entries = history.filter(entry => entry.operationId === operationId).slice().reverse();
  const groups = categories.map(category => ({ id: category.id, label: category.label, entries: entries.filter(entry => category.actions.includes(entry.action)) }));
  const other = entries.filter(entry => !categories.some(category => category.actions.includes(entry.action)));
  if (other.length) groups.push({ id: 'other', label: '其他记录', entries: other });
  return groups;
}
