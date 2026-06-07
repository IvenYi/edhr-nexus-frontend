import { Box, Grid, Card, CardContent, Typography, CardActionArea, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AccountTree, Assignment, Storage, CheckCircle,
  TrendingUp, PendingActions, DoneAll,
} from '@mui/icons-material';
import TodoList from './TodoList';
import DoneList from './DoneList';

const statCards = [
  {
    label: '待办任务',
    value: '--',
    icon: <PendingActions sx={{ fontSize: 28 }} />,
    color: '#1565C0',
    bg: '#E3F2FD',
  },
  {
    label: '运行中流程',
    value: '--',
    icon: <TrendingUp sx={{ fontSize: 28 }} />,
    color: '#00897B',
    bg: '#E0F2F1',
  },
  {
    label: '本月完成',
    value: '--',
    icon: <DoneAll sx={{ fontSize: 28 }} />,
    color: '#2E7D32',
    bg: '#E8F5E9',
  },
];

const quickEntries = [
  { label: '流程中心', icon: <AccountTree fontSize="large" />, path: '/workflow/review-templates', color: '#1565C0' },
  { label: '流程实例', icon: <Assignment fontSize="large" />, path: '/workflow/instances', color: '#00897B' },
  { label: '主数据', icon: <Storage fontSize="large" />, path: '/master-data/product-families', color: '#F57F17' },
  { label: '我的已办', icon: <CheckCircle fontSize="large" />, path: '/workflow/instances', color: '#0277BD' },
];

const cardSx = {
  border: '1px solid #e4e7ed',
  borderRadius: '5px',
  boxShadow: 'none',
  backgroundColor: '#ffffff',
  '&:hover': {
    borderColor: '#d1e9ff',
  },
};

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography sx={{ mb: 0.5, fontSize: 20, fontWeight: 700, color: '#303133' }}>
        首页工作台
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: '20px' }}>
        欢迎回来，以下是你当前的工作概览
      </Typography>

      {/* Stats Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={stat.label}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: '20px' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{ mb: 0.5, fontSize: 24, fontWeight: 700, color: '#303133' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      实时数据
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '5px',
                      bgcolor: stat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Entries */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {quickEntries.map((entry) => (
          <Grid item xs={6} sm={3} key={entry.label}>
            <Card sx={cardSx}>
              <CardActionArea onClick={() => navigate(entry.path)} sx={{ height: 104 }}>
                <CardContent sx={{ textAlign: 'center', p: '16px 12px', '&:last-child': { pb: '16px' } }}>
                  <Box sx={{ color: entry.color, mb: 1 }}>{entry.icon}</Box>
                  <Typography variant="body1" fontWeight={500}>{entry.label}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity Timeline */}
      <Card sx={{ ...cardSx, mb: 4 }}>
        <CardContent sx={{ p: '20px' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>最近活动</Typography>
          <Stack spacing={2}>
            {[
              { time: '14:30', user: '系统', action: 'DHR-2026-001 汇总审核通过', type: 'success' },
              { time: '13:15', user: '李四', action: '提交了批次记录 BP-2026-042', type: 'info' },
              { time: '11:00', user: '张三', action: '完成了 SOP-003 的审核', type: 'success' },
              { time: '09:45', user: '系统', action: '自动生成放行单 RL-2026-018', type: 'default' },
            ].map((item, idx) => (
              <Stack key={idx} direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" color="text.disabled" sx={{ minWidth: 42, fontFamily: 'monospace' }}>
                  {item.time}
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor:
                      item.type === 'success' ? 'success.main' :
                      item.type === 'info' ? 'info.main' : 'text.disabled',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  <strong>{item.user}</strong> · {item.action}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Todo & Done Lists */}
      <Box sx={{ mb: 4 }}>
        <TodoList />
      </Box>
      <Box>
        <DoneList />
      </Box>
    </Box>
  );
}
