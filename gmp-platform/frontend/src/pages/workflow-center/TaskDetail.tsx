import { useParams } from 'react-router-dom';
import { Box, Typography, Button, TextField, Card, CardContent, Stack, Divider } from '@mui/material';
import { useState } from 'react';
import { CheckCircle, Cancel, Forward, Send } from '@mui/icons-material';
import { useSnackbar } from '@/components/SnackbarProvider';
import PageHeader from '@/components/PageHeader';
import client from '@/api/client';

export default function TaskDetail() {
  const { id } = useParams();
  const [opinion, setOpinion] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const { showMessage } = useSnackbar();

  const handleAction = async (action: string, label: string) => {
    setLoading(action);
    try {
      await client.post(`/workflow/tasks/${id}/${action}`, { opinion, password });
      showMessage(`${label}成功`, 'success');
    } catch {
      showMessage(`${label}失败`, 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title={`任务处理`}
        subtitle={`任务编号: #${id}`}
        breadcrumbs={[
          { label: '首页', path: '/' },
          { label: '流程实例', path: '/workflow/instances' },
          { label: `任务 #${id}` },
        ]}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>任务详情</Typography>
          <Typography variant="body2" color="text.secondary">
            展示关联表单、字段权限、审核人等信息。
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>处理操作</Typography>
          <TextField label="审核意见" fullWidth multiline rows={3} sx={{ mb: 2 }}
            value={opinion} onChange={(e) => setOpinion(e.target.value)} />
          <TextField label="签名密码" type="password" fullWidth sx={{ mb: 3 }}
            value={password} onChange={(e) => setPassword(e.target.value)} />

          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleAction('approve', '审核通过')}
              disabled={loading !== null}
            >
              {loading === 'approve' ? '处理中...' : '审核通过'}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleAction('reject', '审核退回')}
              disabled={loading !== null}
            >
              {loading === 'reject' ? '处理中...' : '审核退回'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Forward />}
              onClick={() => handleAction('transfer', '转办')}
              disabled={loading !== null}
            >
              {loading === 'transfer' ? '处理中...' : '转办'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Send />}
              onClick={() => handleAction('submit', '提交')}
              disabled={loading !== null}
            >
              {loading === 'submit' ? '处理中...' : '提交'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
