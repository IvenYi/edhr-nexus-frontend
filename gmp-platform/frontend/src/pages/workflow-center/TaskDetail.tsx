import { useParams } from 'react-router-dom';
import { Box, Typography, Button, TextField, Card, CardContent, Stack } from '@mui/material';
import { useState } from 'react';
import client from '@/api/client';

export default function TaskDetail() {
  const { id } = useParams();
  const [opinion, setOpinion] = useState('');
  const [password, setPassword] = useState('');

  const handleAction = async (action: string) => {
    try {
      await client.post(`/workflow/tasks/${id}/${action}`, { opinion, password });
      alert('操作成功');
    } catch {
      alert('操作失败');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>任务处理 - {id}</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            任务详情区域。展示关联表单、字段权限、审核人等信息。
          </Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>处理操作</Typography>
          <TextField label="审核意见" fullWidth multiline rows={3} sx={{ mb: 2 }}
            value={opinion} onChange={(e) => setOpinion(e.target.value)} />
          <TextField label="签名密码" type="password" fullWidth sx={{ mb: 2 }}
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="success" onClick={() => handleAction('approve')}>审核通过</Button>
            <Button variant="contained" color="error" onClick={() => handleAction('reject')}>审核退回</Button>
            <Button variant="outlined" onClick={() => handleAction('transfer')}>转办</Button>
            <Button variant="outlined" onClick={() => handleAction('submit')}>提交</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
