import client from './client';
export interface WorkflowInstanceRow {
  id: string; templateName: string; businessKey: string; businessType: string; status: string;
  startUserName: string; startTime: string; endTime: string | null;
}
export interface WorkflowOperationTask {
  id: string; nodeId: string; status: string; assigneeId: string | null; assigneeName: string;
  taskState: string; signatureId: string | null; opinion: string | null; action: string | null;
}
export interface WorkflowInstanceView extends WorkflowInstanceRow {
  versionId: string; tasks: WorkflowOperationTask[];
  logs: Array<{ id: string; nodeName: string | null; action: string; operatorName: string; comment: string | null; createdAt: string; snapshot?: string | null }>;
  nodes: Array<{ id: string; name: string; type: string; status: string; positionX: number; positionY: number }>;
  edges: Array<{ id: string; source: string; target: string; label: string | null }>;
}
export interface ResponsibilityCommand { targetUserId: string; reason: string; expectedTaskState: string; account: string; password: string }
export const listWorkflowOperations = async (params: Record<string, unknown>): Promise<{ content: WorkflowInstanceRow[]; totalElements: number; totalPages: number }> =>
  (await client.get('/workflow/operations/instances', { params })).data.data;
export const getWorkflowOperation = async (id: string): Promise<WorkflowInstanceView> => (await client.get(`/workflow/operations/instances/${id}`)).data.data;
export const getResponsibilityTargets = async (id: string, reassign: boolean, keyword: string, signal: AbortSignal): Promise<Array<{ id: string; name: string; username: string }>> =>
  (await client.get(`/workflow/operations/tasks/${id}/${reassign ? 'reassignment' : 'transfer'}-targets`, { params: { keyword }, signal })).data.data;
export const getTransferContext = async (id: string): Promise<{ taskState: string; signatureRequired: boolean; canTransfer: boolean }> =>
  (await client.get(`/workflow/operations/tasks/${id}/transfer-context`)).data.data;
export const changeTaskResponsibility = async (id: string, reassign: boolean, command: ResponsibilityCommand) =>
  client.post(reassign ? `/workflow/operations/tasks/${id}/reassign` : `/record-control/workflow-tasks/${id}/transfer`, command);
export const workflowActionLabel = (action: string) => ({ INSTANCE_START: '发起流程', TASK_CREATE: '创建待办', TASK_COMPLETE: '完成审批',
  APPROVE: '审批通过', REJECT: '审批退回', SUBMIT: '提交', TASK_TRANSFER: '转办', TASK_REASSIGN: '重新分配', INSTANCE_WITHDRAW: '申请撤回', INSTANCE_COMPLETE: '流程完成', INTERVENE: '流程干预' }[action] || action);
