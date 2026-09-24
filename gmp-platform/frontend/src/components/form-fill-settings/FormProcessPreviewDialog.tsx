import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Background, Controls, ReactFlow, ReactFlowProvider, type Node, type NodeProps, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import client from '@/api/client';
import AppDialog from '@/components/AppDialog';
import { StandardFlowNode, STANDARD_FLOW_FIT_VIEW_OPTIONS } from '@/components/flow-designer/FlowDesigner';
import { defaultWorkflowButtons } from '@/components/flow-designer/WorkflowActionConfig';
import { processPermissionSubjects } from './FormFieldPermissions';
import type { DirectFillConfig } from './types';

export type ProcessOption = { id: string; versionId: string; name: string; versionNumber: number; nodesJson?: string; edgesJson?: string };
type PreviewNode = Node<{ kind: 'START' | 'APPROVAL' | 'END'; label: string; config?: DirectFillConfig }>;
const appearance = {
  START: { color: '#1677c8', background: '#e8f4ff' },
  APPROVAL: { color: '#1677c8', background: '#edf6ff' },
  END: { color: '#677386', background: '#eef1f5' },
};
function PreviewNodeView({ id, data }: NodeProps<PreviewNode>) {
  const boundary = data.kind !== 'APPROVAL';
  return <StandardFlowNode id={id} label={data.label} appearance={appearance[data.kind]}
    width={boundary ? 96 : 148} height={boundary ? 52 : 60} boundary={boundary}
    start={data.kind === 'START'} end={data.kind === 'END'} editable={false} selected={false}
    handlesConnectable={false} quickDirections={[]} quickActions={[]} canUseQuickAction={false}
    onOpenQuickMenu={() => {}} onQuickAdd={() => {}} />;
}
const nodeTypes = { preview: PreviewNodeView };

export default function FormProcessPreviewDialog({ option, onClose, onExited }: { option: ProcessOption | null; onClose: () => void; onExited: () => void }) {
  const compact = useMediaQuery(useTheme().breakpoints.down('md'));
  const query = useQuery({
    queryKey: ['form-fill-process', option?.versionId], enabled: Boolean(option),
    queryFn: async () => (await client.get(`/workflow/form-fill-settings/processes/${option!.versionId}`)).data.data as ProcessOption,
  });
  const graph = useMemo(() => {
    if (!query.data) return null;
    try {
      const nodes = JSON.parse(query.data.nodesJson || '[]') as PreviewNode[];
      const edges = JSON.parse(query.data.edgesJson || '[]') as Edge[];
      return { nodes: nodes.map(node => ({ ...node, type: 'preview', selected: false, draggable: false })),
        edges: edges.map(edge => ({ ...edge, selected: false, type: 'smoothstep' })) };
    } catch { return null; }
  }, [query.data]);
  return <AppDialog open={Boolean(option)} onClose={onClose} disableRestoreFocus TransitionProps={{ onExited }} fullWidth maxWidth="lg"
    sx={{ zIndex: theme => theme.zIndex.modal + 200 }}>
    <DialogTitle>流程预览{option ? ` · ${option.name} · V${option.versionNumber}` : ''}</DialogTitle>
    <DialogContent dividers sx={{ p: 0, height: 'min(65vh, 600px)', minHeight: 280 }}>
      {query.isPending ? <Typography sx={{ p: 3 }}>正在加载流程…</Typography>
        : query.isError || !graph ? <Alert severity="error" action={<Button color="inherit" onClick={() => query.refetch()}>重试</Button>}>流程预览加载失败</Alert>
        : !graph.nodes.length ? <Typography sx={{ p: 3 }} color="text.secondary">该流程暂无节点</Typography>
        : <Box sx={{ height: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 300px' }, gridTemplateRows: { xs: 'minmax(280px, 45vh) auto', md: '1fr' } }}>
          <Box sx={{ minWidth: 0, minHeight: 0 }}><ReactFlowProvider key={`${option?.versionId}-${compact}`}><ReactFlow
          nodes={graph.nodes} edges={graph.edges} nodeTypes={nodeTypes} fitView fitViewOptions={STANDARD_FLOW_FIT_VIEW_OPTIONS}
          nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} deleteKeyCode={null}
          proOptions={{ hideAttribution: true }}>
          <Background gap={20} /><Controls showInteractive={false} />
        </ReactFlow></ReactFlowProvider></Box>
          <Box sx={{ p: 2, borderLeft: { md: '1px solid' }, borderTop: { xs: '1px solid', md: 0 }, borderColor: 'divider', overflowY: { md: 'auto' }, minHeight: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>流程配置</Typography>
            {graph.nodes.filter(node => node.data.kind !== 'END').map((node, index) => {
              const config = node.data.config;
              const subjects = processPermissionSubjects({ nodesJson: JSON.stringify([node]) });
              const buttons = config?.buttons?.length ? config.buttons : defaultWorkflowButtons(node.data.kind === 'START' ? 'START' : 'APPROVAL');
              const signatures = (config?.buttonEvents ?? []).filter(event => (event as { enabled?: boolean }).enabled !== false);
              return <Stack key={node.id} spacing={0.75} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={600}>{index + 1}. {node.data.label}</Typography>
                {subjects.map(subject => <Box key={subject.id}>
                  <Typography variant="caption" component="div" sx={{ overflowWrap: 'anywhere' }}>{subject.members}</Typography>
                  <Typography variant="caption" color="text.secondary">默认{subject.defaultPermission === 'READ_ONLY' ? '只读' : '可编辑'}</Typography>
                </Box>)}
                {!subjects.length ? <Typography variant="caption" color="text.secondary">未配置有效权限主体</Typography> : null}
                {node.data.kind === 'APPROVAL' ? <Typography variant="caption" color="text.secondary">任一审批人完成</Typography> : null}
                <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>按钮：{buttons.filter(button => button.visible !== false).map(button => `${button.label}${button.requireOpinion || button.action === 'TRANSFER' ? '（意见/原因必填）' : ''}`).join('、') || '无'}</Typography>
                <Typography variant="caption" color="text.secondary">{signatures.length ? `签署：${signatures.length} 项账户密码签署` : '无需签署'}</Typography>
                {signatures.map(event => <Typography key={event.id} variant="caption" color="text.secondary">
                  {({ SAVE: '保存', SUBMIT: '提交', APPROVE: '审批', RETURN: '退回', TRANSFER: '转办' })[event.action]}前签署{event.builtin === 'FILL_SIGN_FIELD' ? ' · 关联签名字段' : ''}
                </Typography>)}
              </Stack>;
            })}
          </Box>
        </Box>}
    </DialogContent>
    <DialogActions><Button onClick={onClose}>关闭</Button></DialogActions>
  </AppDialog>;
}
