import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Skeleton } from '@mui/material';
import { ArrowForwardRounded, CheckCircleOutlineRounded, InboxOutlined, RefreshRounded } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import client from '@/api/client';
import { TASK_STATUS_MAP } from '@/utils/constants';
import StatusBadge from '@/components/StatusBadge';

interface Task {
  id: string | number;
  instanceId?: string | number;
  instanceName?: string;
  nodeName?: string;
  taskType: string;
  status: string;
  action?: string;
  opinion?: string;
  createdAt?: string;
  completedAt?: string;
}

const taskNames: Record<string, string> = { TODO: '待办任务', APPROVAL: '审批任务', FORM: '表单任务' };
const actionNames: Record<string, string> = { APPROVE: '通过', REJECT: '退回', TRANSFER: '转办', SUBMIT: '提交' };

export default function DashboardTaskList({ kind, assigneeId }: { kind: 'todo' | 'done'; assigneeId?: number }) {
  const [page, setPage] = useState(1);
  const isTodo = kind === 'todo';
  const { data, isLoading, isError, isFetching, refetch } = useQuery<Task[]>({
    queryKey: ['tasks', kind, assigneeId, page],
    enabled: !!assigneeId,
    queryFn: async () => {
      const res = await client.get('/workflow/tasks/' + kind, { params: { page, size: 5 } });
      return res.data.data;
    },
    refetchInterval: isTodo ? 30000 : false,
  });
  const tasks = assigneeId ? data || [] : [];
  const EmptyIcon = isTodo ? InboxOutlined : CheckCircleOutlineRounded;

  return <div className="dashboard-task-list">
    <div className="dashboard-task-toolbar"><span>{isTodo ? '待处理流程任务 · 每 30 秒自动更新' : '已办理的流程任务'}</span><Button size="small" startIcon={<RefreshRounded />} disabled={!assigneeId || isFetching} onClick={() => void refetch()}>刷新</Button></div>
    {!assigneeId ? <div className="dashboard-task-empty"><InboxOutlined /><strong>登录后查看个人任务</strong><span>当前账号信息尚未就绪</span></div>
      : isLoading ? <div className="dashboard-task-loading" role="status" aria-label="任务加载中">{[0, 1, 2].map((item) => <Skeleton key={item} variant="rounded" height={58} />)}</div>
      : isError ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void refetch()}>重试</Button>}>{isTodo ? '待办' : '已办'}加载失败，请重试</Alert>
      : tasks.length === 0 ? <div className="dashboard-task-empty"><EmptyIcon /><strong>{page > 1 ? '本页暂无更多任务' : isTodo ? '暂无待办任务' : '暂无已办记录'}</strong><span>{page > 1 ? '可以返回上一页查看，或刷新任务列表。' : isTodo ? '有新的流程任务分配给你时，会显示在这里。' : '完成任务后，可以在这里回看处理结果。'}</span></div>
      : <ul className="dashboard-task-rows">{tasks.map((task) => {
        const status = TASK_STATUS_MAP[task.status as keyof typeof TASK_STATUS_MAP];
        const time = isTodo ? task.createdAt : task.completedAt;
        return <li key={task.id}>
          <span className={'dashboard-task-marker' + (isTodo ? '' : ' is-done')}><EmptyIcon /></span>
          <div className="dashboard-task-copy"><div className="dashboard-task-title"><strong>{task.nodeName || taskNames[task.taskType] || task.taskType}</strong><StatusBadge label={status?.label || task.status} color={status?.color || 'default'} /></div>
            <p>{task.instanceId ? <Link to={'/workflow/instances/' + task.instanceId}>{task.instanceName || '流程实例 #' + task.instanceId}</Link> : '任务 #' + task.id}</p>
            {!isTodo && (task.action || task.opinion) && <p className="dashboard-task-opinion">{actionNames[task.action || ''] || task.action}{task.opinion ? ' · ' + task.opinion : ''}</p>}
            <span className="dashboard-task-time">{isTodo ? '创建于' : '完成于'} {time && dayjs(time).isValid() ? dayjs(time).format('YYYY-MM-DD HH:mm') : '—'}</span>
          </div>
          {isTodo && <Button component={Link} to={'/workflow/tasks/' + task.id} size="small" variant="outlined" endIcon={<ArrowForwardRounded />}>处理</Button>}
        </li>;
      })}</ul>}
    {!!assigneeId && <div className="dashboard-task-pagination"><span>第 {page} 页 · 每页最多 5 条</span><div><Button size="small" disabled={page === 1 || isFetching} onClick={() => setPage(page - 1)}>上一页</Button><Button size="small" disabled={tasks.length < 5 || isFetching || isError} onClick={() => setPage(page + 1)}>下一页</Button></div></div>}
  </div>;
}
