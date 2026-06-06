import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Pagination, CircularProgress, Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { listInstances } from '@/api/workflow-instances';
import { INSTANCE_STATUS_MAP } from '@/utils/constants';
import type { PageResult } from '@/types/common';

interface WorkflowInstance {
  id: number;
  templateName: string;
  businessKey: string;
  status: string;
  startUserName: string;
  startTime: string;
  endTime: string;
}

export default function InstanceList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['workflow-instances', page],
    queryFn: async () => {
      const res = await listInstances({ page, size: 10 });
      return res.data.data as PageResult<WorkflowInstance>;
    },
  });

  const content = data?.content ?? [];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">流程实例列表</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>模板名称</TableCell>
              <TableCell>业务编号</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>发起人</TableCell>
              <TableCell>开始时间</TableCell>
              <TableCell>结束时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={8} align="center">加载失败</TableCell></TableRow>
            ) : content.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center">暂无数据</TableCell></TableRow>
            ) : (
              content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.templateName}</TableCell>
                  <TableCell>{item.businessKey}</TableCell>
                  <TableCell>
                    <Chip size="small" label={INSTANCE_STATUS_MAP[item.status as keyof typeof INSTANCE_STATUS_MAP]?.label || item.status}
                      color={INSTANCE_STATUS_MAP[item.status as keyof typeof INSTANCE_STATUS_MAP]?.color || 'default'} />
                  </TableCell>
                  <TableCell>{item.startUserName}</TableCell>
                  <TableCell>{item.startTime}</TableCell>
                  <TableCell>{item.endTime || '-'}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/workflow/instances/${item.id}`)}>详情</Button>
                    <Button size="small" onClick={() => navigate(`/workflow/instances/${item.id}/logs`)}>日志</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {data && data.totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={data.totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}
    </Box>
  );
}
