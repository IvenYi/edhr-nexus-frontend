import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { ReactFlow, Background, Controls, MarkerType, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import DetailSection from '@/components/FormDialogSection';
import StatusBadge from '@/components/StatusBadge';
import WorkflowResponsibilityDialog from '@/components/workflow/WorkflowResponsibilityDialog';
import { useAuthStore } from '@/stores/authStore';
import { getWorkflowOperation, workflowActionLabel, type WorkflowOperationTask } from '@/api/workflow-operations';
import { INSTANCE_STATUS_MAP, NODE_TYPE_MAP } from '@/utils/constants';
import { StandardFlowNode } from '@/components/flow-designer/FlowDesigner';

function RuntimeNode({ id, data }: NodeProps) {
  const kind = String(data.kind);
  const boundary = kind === 'START' || kind === 'END';
  return <StandardFlowNode id={id} label={String(data.label)} caption={data.current ? '当前节点' : undefined}
    appearance={{ color: NODE_TYPE_MAP[kind as keyof typeof NODE_TYPE_MAP]?.color || '#606266', background: '#fff' }}
    width={boundary ? 96 : 148} height={boundary ? 52 : 60} boundary={boundary} start={kind === 'START'} end={kind === 'END'}
    editable={false} selected={Boolean(data.current)} quickDirections={[]} quickActions={[]} canUseQuickAction={false}
    onOpenQuickMenu={() => {}} onQuickAdd={() => {}} handlesConnectable={false}
    targetDirections={kind === 'START' ? [] : ['top']} sourceDirections={kind === 'END' ? [] : ['bottom']} />;
}
const nodeTypes = { runtime: RuntimeNode };

function responsibilityEvidence(snapshot?: string | null) {
  if (!snapshot) return null;
  try {
    const value = JSON.parse(snapshot) as { previousAssigneeId?: string; previousAssigneeName?: string; assigneeId?: string; assigneeName?: string; signatureId?: string };
    if (!value.assigneeId) return null;
    return <><Typography variant="body2">原处理人：{value.previousAssigneeName || value.previousAssigneeId || '候选人待处理'} → 新处理人：{value.assigneeName || value.assigneeId}</Typography>
      {value.signatureId && <Typography variant="caption" color="text.secondary">签名记录：{value.signatureId}</Typography>}</>;
  } catch { return null; }
}

export default function WorkflowInstancePanel({ id, audit = false, intervention = false }: { id: string; audit?: boolean; intervention?: boolean }) {
  const query = useQuery({ queryKey: ['workflow-operation', id], queryFn: () => getWorkflowOperation(id), retry: false });
  const canIntervene = useAuthStore(state => state.hasPermission('workflow.intervene'));
  const [selected, setSelected] = useState<WorkflowOperationTask | null>(null);
  const data = query.data;
  const nodes = useMemo(() => data?.nodes.map(node => ({ id: node.id, type: 'runtime', position: { x: node.positionX || 0, y: node.positionY || 0 },
    data: { label: node.name, kind: node.type, current: node.status === 'CURRENT' },
  })) ?? [], [data]);
  const edges = useMemo(() => data?.edges.map(edge => ({ ...edge, sourceHandle: 'source-bottom', targetHandle: 'target-top', label: edge.label ?? undefined, markerEnd: { type: MarkerType.ArrowClosed } })) ?? [], [data]);
  if (query.isLoading) return <Box sx={{ minHeight: 200, display: 'grid', placeItems: 'center' }}><CircularProgress size={24} /></Box>;
  if (!data || query.isError) return <Alert severity="error" action={<Button onClick={() => void query.refetch()}>重试</Button>}>流程详情加载失败</Alert>;
  const status = INSTANCE_STATUS_MAP[data.status as keyof typeof INSTANCE_STATUS_MAP];
  return <>
    {!audit ? <>
      <DetailSection title="流程信息"><Stack spacing={1}>
        <Typography variant="body2">{data.templateName} · {data.businessKey || data.id}</Typography>
        <StatusBadge label={status?.label || data.status} color={status?.color || 'default'} />
        <Typography variant="body2" color="text.secondary">发起人：{data.startUserName} · {data.startTime?.replace('T', ' ').slice(0, 19)}</Typography>
      </Stack></DetailSection>
      <DetailSection title="流程图"><Box sx={{ height: 260 }}>{nodes.length ? <ReactFlow nodes={nodes} nodeTypes={nodeTypes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
        ariaLabelConfig={{ 'controls.ariaLabel': '流程图控制', 'controls.zoomIn.ariaLabel': '放大', 'controls.zoomOut.ariaLabel': '缩小', 'controls.fitView.ariaLabel': '适应视图' }}
        proOptions={{ hideAttribution: true }}><Background /><Controls showInteractive={false} /></ReactFlow> : <Typography variant="body2" color="text.secondary">暂无流程图</Typography>}</Box></DetailSection>
      <DetailSection title={intervention ? '当前任务' : '审批任务'}><Stack spacing={1.5}>
        {!data.tasks.length && <Typography variant="body2" color="text.secondary">暂无任务</Typography>}
        {data.tasks.map(task => <Box key={task.id}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between"><Box sx={{ minWidth: 0 }}>
            <Typography variant="body2">{data.nodes.find(node => node.id === task.nodeId)?.name || '审批任务'} · {task.assigneeName}</Typography>
            <Typography variant="caption" color="text.secondary">{['PENDING', 'PROCESSING'].includes(task.status) ? '待处理' : task.status === 'WITHDRAWN' ? '已撤回' : task.status === 'REJECTED' ? '已退回' : task.status === 'TERMINATED' ? '已终止' : '已处理'} · {task.id}</Typography>
          </Box>{intervention && canIntervene && data.status === 'RUNNING' && ['PENDING', 'PROCESSING'].includes(task.status)
            && <Button size="small" variant="outlined" sx={{ flexShrink: 0 }} onClick={() => setSelected(task)}>重新分配</Button>}</Stack>
          {task.opinion && <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: 'pre-wrap' }}>{task.opinion}</Typography>}
          {task.signatureId && <Typography variant="caption" color="text.secondary">签名记录：{task.signatureId}</Typography>}
        </Box>)}
      </Stack></DetailSection>
    </> : <DetailSection title="运行日志"><Stack spacing={1.5}>
      {!data.logs.length && <Typography variant="body2" color="text.secondary">暂无日志</Typography>}
      {data.logs.map((log, index) => <Box key={log.id}>
        <Typography variant="body2" fontWeight={500}>{workflowActionLabel(log.action)}{log.nodeName ? ` · ${log.nodeName}` : ''}</Typography>
        <Typography variant="caption" color="text.secondary">{log.operatorName} · {log.createdAt?.replace('T', ' ').slice(0, 19)}</Typography>
        {log.comment && <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{log.action === 'TASK_CREATE' ? '已创建当前节点待办' : log.comment}</Typography>}
        {responsibilityEvidence(log.snapshot)}
        {index < data.logs.length - 1 && <Divider sx={{ mt: 1.5 }} />}
      </Box>)}
    </Stack></DetailSection>}
    {selected && <WorkflowResponsibilityDialog taskId={selected.id} taskState={selected.taskState} previousAssignee={selected.assigneeName} reassign
      onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); void query.refetch(); }} />}
  </>;
}
