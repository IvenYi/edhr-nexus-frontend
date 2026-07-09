import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import EmptyState from '@/components/EmptyState';
import client from '@/api/client';
import type { PageResult } from '@/types/common';

interface Item {
  id: number;
  code: string;
  title: string;
  version: string;
  fileReference: string;
  status: string;
  createdAt: string;
}

export default function SopDocumentPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Item>>({ code: '', title: '', version: '', fileReference: '' });
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const apiBase = '/master-data/sop-documents';

  const { data, isLoading, error } = useQuery({
    queryKey: ['sop-documents', page],
    queryFn: async () => {
      const res = await client.get(apiBase, { params: { page, size: 20 } });
      return res.data.data as PageResult<Item>;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Item>) => client.post(apiBase, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sop-documents'] }); setOpen(false); setForm({ code: '', title: '', version: '', fileReference: '' }); setEditing(null); },
  });

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Item>) => client.put(`${apiBase}/${editing?.id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sop-documents'] }); setOpen(false); setForm({ code: '', title: '', version: '', fileReference: '' }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => client.delete(`${apiBase}/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sop-documents'] }); setDeleteTarget(null); },
  });

  const handleSubmit = () => {
    const body = { code: form.code, title: form.title, version: form.version, fileReference: form.fileReference };
    if (editing) updateMutation.mutate(body);
    else createMutation.mutate(body);
  };

  const content = data?.content ?? [];

  return (
    <Box>
      <PageHeader
        title="SOP 文档管理"
        subtitle="管理标准操作规程文档，支持版本控制与文件引用"
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => {
            setEditing(null); setForm({ code: '', title: '', version: '', fileReference: '' }); setOpen(true);
          }}>新增</Button>
        }
      />

      {error && (
        <EmptyState title="加载失败" description={String(error)} />
      )}

      {isLoading ? (
        <TableSkeleton columns={8} rows={8} />
      ) : content.length === 0 ? (
        <EmptyState
          title="暂无 SOP 文档"
          description="点击「新增」按钮创建第一个 SOP 文档"
          action={{ label: '新增', onClick: () => { setEditing(null); setForm({ code: '', title: '', version: '', fileReference: '' }); setOpen(true); } }}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>编码</TableCell>
                <TableCell>标题</TableCell>
                <TableCell>版本</TableCell>
                <TableCell>文件引用</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>创建时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{item.id}</TableCell>
                  <TableCell>{item.code || '-'}</TableCell>
                  <TableCell>{item.title || '-'}</TableCell>
                  <TableCell>{item.version || '-'}</TableCell>
                  <TableCell>{item.fileReference || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={item.status}
                      color={item.status === 'EFFECTIVE' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => { setEditing(item); setForm(item); setOpen(true); }}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data && data.totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={data.totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? '编辑' : '新增'}SOP 文档</DialogTitle>
        <DialogContent>
          <TextField label="编码" fullWidth margin="dense" value={form.code ?? ''}
            onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} />
          <TextField label="标题" fullWidth margin="dense" value={form.title ?? ''}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} />
          <TextField label="版本" fullWidth margin="dense" value={form.version ?? ''}
            onChange={e => setForm(prev => ({ ...prev, version: e.target.value }))} />
          <TextField label="文件引用" fullWidth margin="dense" value={form.fileReference ?? ''}
            onChange={e => setForm(prev => ({ ...prev, fileReference: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={`确定删除 SOP 文档「${deleteTarget?.title || deleteTarget?.code}」吗？此操作不可撤销。`}
        confirmText="删除"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
        destructive
      />
    </Box>
  );
}
