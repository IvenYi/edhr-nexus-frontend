import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Box,
} from '@mui/material';
import client from '@/api/client';
import { TASK_STATUS_MAP } from '@/utils/constants';

interface Task {
  id: number;
  taskType: string;
  status: string;
  instanceName?: string;
  nodeName?: string;
  createdAt: string;
}

export default function TodoList() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['tasks', 'todo'],
    queryFn: async () => {
      const res = await client.get('/workflow/tasks/todo', { params: { page: 1, size: 5 } });
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const tasks: Task[] = data?.content || [];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">我的待办</Typography>
          <Button size="small" onClick={() => navigate('/workflow/instances')}>
            查看全部
          </Button>
        </Box>
        {isLoading ? (
          <Typography color="text.secondary">加载中...</Typography>
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary">暂无待办任务</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>任务类型</TableCell>
                  <TableCell>来源</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>创建时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.taskType}</TableCell>
                    <TableCell>{task.instanceName || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={TASK_STATUS_MAP[task.status as keyof typeof TASK_STATUS_MAP]?.label || task.status}
                        color={TASK_STATUS_MAP[task.status as keyof typeof TASK_STATUS_MAP]?.color || 'default'}
                      />
                    </TableCell>
                    <TableCell>{task.createdAt}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/workflow/tasks/${task.id}`)}
                      >
                        处理
                      </Button>
                    </TableCell>
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
