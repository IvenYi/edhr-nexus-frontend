import { useQuery } from '@tanstack/react-query';
import {
  Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import client from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import { TASK_STATUS_MAP } from '@/utils/constants';
import StatusBadge from '@/components/StatusBadge';

interface DoneTask {
  id: number;
  taskType: string;
  action: string;
  opinion: string;
  completedAt: string;
  status: string;
}

export default function DoneList() {
  const assigneeId = useAuthStore((state) => state.user?.id);
  const { data, isLoading, isError } = useQuery<DoneTask[]>({
    queryKey: ['tasks', 'done', assigneeId],
    enabled: !!assigneeId,
    queryFn: async () => {
      const res = await client.get('/workflow/tasks/done', { params: { page: 1, size: 5 } });
      return res.data.data;
    },
  });

  const tasks = data || [];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>我的已办</Typography>
        {isLoading ? (
          <Typography color="text.secondary">加载中...</Typography>
        ) : isError ? (
          <Typography color="error">已办加载失败，请刷新重试</Typography>
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary">暂无已办记录</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>任务类型</TableCell>
                  <TableCell>操作</TableCell>
                  <TableCell>意见</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>完成时间</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.taskType}</TableCell>
                    <TableCell>{task.action}</TableCell>
                    <TableCell>{task.opinion || '-'}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={TASK_STATUS_MAP[task.status as keyof typeof TASK_STATUS_MAP]?.label || task.status}
                        color={TASK_STATUS_MAP[task.status as keyof typeof TASK_STATUS_MAP]?.color || 'default'}
                      />
                    </TableCell>
                    <TableCell>{task.completedAt || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
