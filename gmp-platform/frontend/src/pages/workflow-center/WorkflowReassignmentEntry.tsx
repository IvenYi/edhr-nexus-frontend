import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import FormDialog from '@/components/FormDialog';
import WorkflowResponsibilityDialog from '@/components/workflow/WorkflowResponsibilityDialog';
import { getWorkflowOperation, workflowBusinessTypeLabel } from '@/api/workflow-operations';

export default function WorkflowReassignmentEntry({ id, onClose, onSuccess }: {
  id: string; onClose: () => void; onSuccess: () => void;
}) {
  const [taskId, setTaskId] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['workflow-operation', id], queryFn: () => getWorkflowOperation(id), retry: false, refetchOnMount: 'always' });
  const data = query.data;
  const businessDescription = data ? `${workflowBusinessTypeLabel(data.businessType)} · ${data.businessKey || data.id}` : undefined;
  const tasks = data?.status === 'RUNNING'
    ? data.tasks.filter(task => ['PENDING', 'PROCESSING'].includes(task.status)) : [];
  const selected = taskId ? tasks.find(task => task.id === taskId) : tasks.length === 1 ? tasks[0] : null;
  if (!query.isFetching && !query.isError && selected) return <WorkflowResponsibilityDialog key={selected.id}
    taskId={selected.id} taskState={selected.taskState} previousAssignee={selected.assigneeName} businessDescription={businessDescription} reassign
    onClose={onClose} onSuccess={onSuccess} />;
  return <FormDialog open fullWidth maxWidth="sm" onClose={onClose} aria-labelledby="reassignment-entry-title">
    <DialogTitle id="reassignment-entry-title">重新分配</DialogTitle>
    <DialogContent dividers>
      {businessDescription && <Typography variant="body2" sx={{ mb: 1.5 }}>{businessDescription}</Typography>}
      {query.isFetching ? <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={24} /></Stack>
        : query.isError ? <Alert severity="error" action={<Button onClick={() => void query.refetch()}>重试</Button>}>当前任务加载失败</Alert>
        : !tasks.length ? <Alert severity="info">{data?.status === 'RUNNING' ? '暂无可重新分配的当前任务' : '该流程已结束，无法重新分配'}</Alert>
        : <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">该流程有多项当前任务，请选择本次要重新分配的任务。</Typography>
          {tasks.map(task => <Button key={task.id} variant="outlined" aria-label={`选择任务 ${task.id}`}
            sx={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => setTaskId(task.id)}>
            <Stack sx={{ minWidth: 0 }}><Typography variant="body2">{data?.nodes.find(node => node.id === task.nodeId)?.name || '审批任务'} · {task.assigneeName}</Typography>
              <Typography variant="caption" color="text.secondary">任务 {task.id}</Typography></Stack>
          </Button>)}
        </Stack>}
    </DialogContent>
    <DialogActions><Button onClick={onClose}>取消</Button></DialogActions>
  </FormDialog>;
}
