import {
  useQuery,
  useMutation,
  useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination,
} from '@mui/material';
import FormDialog from '@/components/FormDialog';
import FormDialogSection from '@/components/FormDialogSection';
import FormDialogFieldGrid from '@/components/FormDialogFieldGrid';
import { listTableBodyCellSx, listTableHeaderCellSx, listTableStickyActionSx } from '@/components/listTableStyles';
import { Add, Edit, Delete } from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { ListTableShell } from '@/components/ListTableShell';
import ConfirmDialog from '@/components/ConfirmDialog';
import TableSkeleton from '@/components/TableSkeleton';
import EmptyState from '@/components/EmptyState';
import client from '@/api/client';
import type { PageResult } from '@/types/common';

interface Item {
  id: number;
  code: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Item>>({ code: '', name: '', description: '' });
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const apiBase = '/master-data/product-families';

  const { data, isLoading, error } = useQuery({
    queryKey: ['master-data-product-families', page],
    queryFn: async () => {
      const res = await client.get(apiBase, { params: { page, size: 20 } });
      return res.data.data as PageResult<Item>;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Item>) => client.post(apiBase, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['master-data-product-families'] }); setOpen(false); setForm({ code: '', name: '', description: '' }); setEditing(null); },
  });

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Item>) => client.put(`${apiBase}/${editing?.id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['master-data-product-families'] }); setOpen(false); setForm({ code: '', name: '', description: '' }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => client.delete(`${apiBase}/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['master-data-product-families'] }); setDeleteTarget(null); },
  });

  const handleSubmit = () => {
    const body = { code: form.code, name: form.name, description: form.description };
    if (editing) updateMutation.mutate(body);
    else createMutation.mutate(body);
  };

  const content = data?.content ?? [];
  const showSkeleton = isLoading;
  const showEmpty = !isLoading && content.length === 0;
  const showError = !!error;

  return (
    <Box>
      <PageHeader
        title="产品家族管理"
        subtitle="管理产品线分组，用于组织主数据和DHR记录"
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { setEditing(null); setForm({ code: '', name: '', description: '' }); setOpen(true); }}
          >
            新增
          </Button>
        }
      />

      {showError && (
        <EmptyState title="加载失败" description={String(error)} />
      )}

      {showSkeleton ? (
        <TableSkeleton columns={6} rows={8} />
      ) : showEmpty ? (
        <EmptyState
          title="暂无产品家族"
          description="点击「新增」按钮创建第一个产品家族"
          action={{ label: '新增', onClick: () => { setEditing(null); setForm({ code: '', name: '', description: '' }); setOpen(true); } }}
        />
      ) : (
        <ListTableShell>
          <Table>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': listTableHeaderCellSx }}>
                <TableCell sx={listTableHeaderCellSx}>ID</TableCell>
                <TableCell sx={listTableHeaderCellSx}>编码</TableCell>
                <TableCell sx={listTableHeaderCellSx}>名称</TableCell>
                <TableCell sx={listTableHeaderCellSx}>描述</TableCell>
                <TableCell sx={listTableHeaderCellSx}>创建时间</TableCell>
                <TableCell align="center" sx={{ ...listTableHeaderCellSx, ...listTableStickyActionSx(96, 'head') }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id} sx={{ '& .MuiTableCell-root': listTableBodyCellSx }}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.code || '-'}</TableCell>
                  <TableCell>{item.name || '-'}</TableCell>
                  <TableCell>{item.description || '-'}</TableCell>
                  <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : '-'}</TableCell>
                  <TableCell align="center" sx={listTableStickyActionSx(96, 'body')}>
                    <Tooltip title="编辑"><IconButton size="small" aria-label="编辑" onClick={() => { setEditing(item); setForm(item); setOpen(true); }}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="删除"><IconButton size="small" color="error" aria-label="删除" onClick={() => setDeleteTarget(item)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ListTableShell>
      )}

      {data && data.totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={data.totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <FormDialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? '编辑' : '新增'}产品家族</DialogTitle>
        <DialogContent dividers>
          <FormDialogSection title="基本信息">
          <FormDialogFieldGrid hasTrailingFullRow>
              {editing && <TextField label="ID" size="small" fullWidth value={form.id ?? ''} disabled />}
              <TextField label="编码" size="small" fullWidth value={form.code ?? ''} onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} />
              <TextField label="名称" size="small" fullWidth value={form.name ?? ''} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
              <TextField label="描述" size="small" fullWidth multiline rows={3} sx={{ gridColumn: '1 / -1' }} value={form.description ?? ''} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
            </FormDialogFieldGrid>
          </FormDialogSection>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </FormDialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        deletionTarget={deleteTarget && { type: 'product_family', id: deleteTarget.id }}
        open={deleteTarget !== null}
        message={`确定删除「${deleteTarget?.name}」吗？此操作不可撤销。`}
        confirmText="删除"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
        destructive
      />
    </Box>
  );
}
