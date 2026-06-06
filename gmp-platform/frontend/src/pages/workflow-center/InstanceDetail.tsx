import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, CircularProgress,
} from '@mui/material';
import { getInstance } from '@/api/workflow-instances';
import { getInstanceLogs } from '@/api/workflow-logs';
import { INSTANCE_STATUS_MAP, NODE_TYPE_MAP } from '@/utils/constants';

interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  status: string;
}

interface InstanceDetail {
  id: number;
  templateName: string;
  businessKey: string;
  status: string;
  startUserName: string;
  startTime: string;
  endTime: string;
  nodes: WorkflowNode[];
}

interface InstanceLog {
  id: number;
  nodeName: string;
  action: string;
  operatorName: string;
  comment: string;
  createdAt: string;
}

export default function InstanceDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: instance, isLoading, isError } = useQuery({
    queryKey: ['workflow-instance', id],
    queryFn: async () => {
      const res = await getInstance(Number(id));
      return res.data.data as InstanceDetail;
    },
    enabled: !!id,
  });

  const { data: logs } = useQuery({
    queryKey: ['workflow-instance-logs', id],
    queryFn: async () => {
      const res = await getInstanceLogs(Number(id), { size: 100 });
      const body = res.data.data as { content: InstanceLog[] } | InstanceLog[];
      return Array.isArray(body) ? body : body.content ?? [];
    },
    enabled: !!id,
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (isError || !instance) return <Box sx={{ textAlign: 'center', py: 4 }}>加载失败或实例不存在</Box>;

  const nodes = instance.nodes ?? [];
  const logList = logs ?? [];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>流程实例详情 - {instance.businessKey}</Typography>

      {/* Basic Info */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">模板名称</Typography>
            <Typography variant="body1">{instance.templateName}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">业务编号</Typography>
            <Typography variant="body1">{instance.businessKey}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">状态</Typography>
            <Chip size="small" label={INSTANCE_STATUS_MAP[instance.status as keyof typeof INSTANCE_STATUS_MAP]?.label || instance.status}
              color={INSTANCE_STATUS_MAP[instance.status as keyof typeof INSTANCE_STATUS_MAP]?.color || 'default'} />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">发起人</Typography>
            <Typography variant="body1">{instance.startUserName}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">开始时间</Typography>
            <Typography variant="body1">{instance.startTime}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">结束时间</Typography>
            <Typography variant="body1">{instance.endTime || '-'}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Workflow Nodes */}
      <Typography variant="h6" sx={{ mb: 2 }}>流程节点</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
          {nodes.length === 0 ? (
            <Typography color="text.secondary">暂无节点信息</Typography>
          ) : (
            nodes.map((node, index) => (
              <Box key={node.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  border: `2px solid ${NODE_TYPE_MAP[node.type as keyof typeof NODE_TYPE_MAP]?.color || '#999'}`,
                  borderRadius: node.type === 'START' || node.type === 'END' ? '50%' : 1,
                  width: 80, height: 80, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper',
                  fontSize: 12, p: 1, textAlign: 'center',
                }}>
                  <Typography variant="caption" fontWeight="bold">
                    {NODE_TYPE_MAP[node.type as keyof typeof NODE_TYPE_MAP]?.label || node.type}
                  </Typography>
                  <Typography variant="caption">{node.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{node.status}</Typography>
                </Box>
                {index < nodes.length - 1 && (
                  <Box sx={{ width: 40, height: 2, bgcolor: 'primary.main' }} />
                )}
              </Box>
            ))
          )}
        </Box>
      </Paper>

      {/* Audit Timeline */}
      <Typography variant="h6" sx={{ mb: 2 }}>操作日志</Typography>
      <Paper sx={{ p: 2 }}>
        {logList.length === 0 ? (
          <Typography color="text.secondary">暂无日志</Typography>
        ) : (
          <Box sx={{ pl: 2 }}>
            {logList.map((log, index) => (
              <Box key={log.id} sx={{ display: 'flex', mb: index < logList.length - 1 ? 3 : 0 }}>
                {/* Timeline line + dot */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  {index < logList.length - 1 && (
                    <Box sx={{ width: 2, flex: 1, bgcolor: 'grey.300', minHeight: 40 }} />
                  )}
                </Box>
                {/* Content */}
                <Box sx={{ pb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">{log.nodeName} - {log.action}</Typography>
                  <Typography variant="body2" color="text.secondary">{log.operatorName} | {log.createdAt}</Typography>
                  {log.comment && <Typography variant="body2">{log.comment}</Typography>}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
