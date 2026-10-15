import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';
import FormDialog from '@/components/FormDialog';
import TableStateCell from '@/components/TableStateCell';
import { useSnackbar } from '@/components/SnackbarProvider';
import { listTableBodyCellSx, listTableHeaderCellSx, listTableStickyActionSx } from '@/components/listTableStyles';
import { formLookupCatalogKey, getFormLookupBindings, unlinkFormLookupBindings, type FormLookupBinding, type FormLookupItem } from '@/api/formLookupCatalog';
import FormLookupBindingPreview from './FormLookupBindingPreview';

const keyOf = (row: FormLookupBinding) => JSON.stringify([row.versionId, row.bindingId, row.fieldId]);

export default function FormLookupBindingsDialog({ item, onClose }: { item: FormLookupItem; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showMessage } = useSnackbar();
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<FormLookupBinding>();
  const queryKey = ['form-lookup-bindings', item.id];
  const bindings = useQuery({ queryKey, queryFn: () => getFormLookupBindings(item.id), staleTime: 0 });
  const rows = bindings.data ?? [];
  const selectedRows = rows.filter(row => selected.includes(keyOf(row)));
  const unlink = useMutation({ mutationFn: () => unlinkFormLookupBindings(item.id, selectedRows), onSuccess: async () => {
    setSelected([]);
    await Promise.all([queryClient.invalidateQueries({ queryKey }), queryClient.invalidateQueries({ queryKey: formLookupCatalogKey }),
      queryClient.invalidateQueries({ queryKey: ['form-projection-catalog'] }), queryClient.invalidateQueries({ queryKey: ['form-template-version'] })]);
    showMessage('已解除所选追溯关联', 'success');
  } });
  const refresh = () => { setSelected([]); unlink.reset(); void bindings.refetch(); };
  const busy = unlink.isPending || bindings.isFetching;
  const stateText = bindings.isPending ? '加载中…' : bindings.isError ? '关联读取失败，请重试' : rows.length ? '' : '暂无关联配置';
  return <FormDialog open onClose={() => { if (!unlink.isPending) onClose(); }} fullWidth maxWidth="md">
    <DialogTitle>关联配置 · {item.name}</DialogTitle>
    <DialogContent dividers>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>勾选需要解除的字段关联；历史填报内容保留。</Typography>
      {bindings.isError && <Alert severity="error" action={<Button onClick={refresh}>重试</Button>}>关联配置读取失败</Alert>}
      {unlink.isError && <Alert severity="error" sx={{ mb: 1.5 }} action={<Button onClick={refresh}>刷新</Button>}>{unlink.error instanceof Error ? unlink.error.message : '解除失败，请重试'}</Alert>}
      <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'auto', maxHeight: 420 }}>
        <Table size="small" stickyHeader aria-label="追溯项关联配置" sx={{ minWidth: 620 }}>
          <TableHead><TableRow>
            <TableCell padding="checkbox" sx={listTableHeaderCellSx}><Checkbox size="small" inputProps={{ 'aria-label': '全选关联配置' }} disabled={busy || !rows.length}
              checked={rows.length > 0 && selectedRows.length === rows.length} indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
              onChange={event => setSelected(event.target.checked ? rows.map(keyOf) : [])} /></TableCell>
            {['表单模板', '版本', '位置', '字段'].map(label => <TableCell key={label} sx={listTableHeaderCellSx}>{label}</TableCell>)}
            <TableCell align="center" sx={{ ...listTableHeaderCellSx, ...listTableStickyActionSx(64, 'head') }}>操作</TableCell>
          </TableRow></TableHead>
          <TableBody>{stateText ? <TableRow><TableStateCell colSpan={6}>{stateText}</TableStateCell></TableRow> : rows.map(row => <TableRow key={keyOf(row)} hover selected={selected.includes(keyOf(row))}>
            <TableCell padding="checkbox" sx={listTableBodyCellSx}><Checkbox size="small" disabled={busy} inputProps={{ 'aria-label': `选择${row.templateName} ${row.version} ${row.location} ${row.fieldName}` }}
              checked={selected.includes(keyOf(row))} onChange={event => setSelected(current => event.target.checked ? [...current, keyOf(row)] : current.filter(key => key !== keyOf(row)))} /></TableCell>
            {[row.templateName, row.version, row.location, row.fieldName].map((value, index) => <TableCell key={index} sx={listTableBodyCellSx}>{value}</TableCell>)}
            <TableCell align="center" sx={{ ...listTableBodyCellSx, ...listTableStickyActionSx(64, 'body') }}><Tooltip title="预览定位"><IconButton size="small" disabled={unlink.isPending} aria-label={`预览${row.templateName} ${row.version} ${row.location} ${row.fieldName}`} onClick={() => setPreview(row)}><VisibilityOutlined fontSize="small" /></IconButton></Tooltip></TableCell>
          </TableRow>)}</TableBody>
        </Table>
      </Box>
    </DialogContent>
    <DialogActions><Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>已选 {selectedRows.length} / {rows.length} 项</Typography>
      <Button onClick={refresh} disabled={busy}>刷新</Button><Button onClick={onClose} disabled={unlink.isPending}>关闭</Button>
      <Button variant="contained" color="error" disabled={busy || bindings.isError || !selectedRows.length} onClick={() => unlink.mutate()}>{unlink.isPending ? '解除中…' : '解除关联'}</Button>
    </DialogActions>
    {preview && <FormLookupBindingPreview key={keyOf(preview)} itemId={item.id} binding={preview} onClose={() => setPreview(undefined)} />}
  </FormDialog>;
}
