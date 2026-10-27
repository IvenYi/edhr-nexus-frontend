import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AppDialog from './AppDialog';
import { getWorkOrder, listProcessOptions, updateProductionObject, type ProductionObject } from '@/api/work-orders';

export default function ProductionObjectEditDialog({ object, onClose }: { object: ProductionObject; onClose: () => void }) {
  const client = useQueryClient();
  const [form, setForm] = useState({ processVersionId: object.processVersionId, targetQuantity: String(object.targetQuantity), remark: object.remark || '', plannedStartAt: object.plannedStartAt?.slice(0, 16) || '', plannedEndAt: object.plannedEndAt?.slice(0, 16) || '' });
  const options = useQuery({ queryKey: ['production-process-options', object.workOrderId], queryFn: async () => (await listProcessOptions(object.workOrderId)).data.data });
  const order = useQuery({ queryKey: ['work-order', object.workOrderId], queryFn: async () => (await getWorkOrder(object.workOrderId)).data.data });
  const max = order.data ? Math.round((Number(order.data.plannedQuantity) - Number(order.data.allocatedQuantity) + Number(object.targetQuantity)) * 10000) / 10000 : null;
  const quantity = Number(form.targetQuantity);
  const invalidQuantity = !Number.isFinite(quantity) || quantity <= 0 || (max !== null && quantity > max);
  const invalidDates = Boolean(form.plannedStartAt && form.plannedEndAt && form.plannedEndAt < form.plannedStartAt);
  const save = useMutation({
    mutationFn: () => updateProductionObject(object.id, { ...form, targetQuantity: quantity, plannedStartAt: form.plannedStartAt || null, plannedEndAt: form.plannedEndAt || null }),
    onSuccess: async () => { await Promise.all([['production-objects'], ['work-orders'], ['work-order'], ['production-batches'], ['production-batch-audit'], ['production-execution']].map(queryKey => client.invalidateQueries({ queryKey }))); onClose(); },
  });
  return <AppDialog open onClose={() => !save.isPending && onClose()} maxWidth="sm" fullWidth>
    <DialogTitle>修改批次配置 · {object.objectNo}</DialogTitle>
    <DialogContent dividers><Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">开工前可调整制程和数量。开工后按当时配置冻结，生产形态保持为{object.objectType === 'SN' ? ' SN' : '批次'}。</Typography>
      {(options.isError || order.isError) && <Alert severity="error">候选或工单加载失败，请重试。<Button size="small" onClick={() => { void options.refetch(); void order.refetch(); }}>重试</Button></Alert>}
      <TextField select fullWidth label="制程版本" value={form.processVersionId} onChange={e => setForm({ ...form, processVersionId: e.target.value })}>
        {!(options.data ?? []).some(item => item.id === object.processVersionId) && <MenuItem value={object.processVersionId}>{object.processVersion}（当前引用，保存及开工时校验）</MenuItem>}
        {(options.data ?? []).map(item => <MenuItem key={item.id} value={item.id}>{item.processReference?.ownerName} · {item.version} · {item.productionForm}</MenuItem>)}
      </TextField>
      <TextField required label="目标数量" type="number" value={form.targetQuantity} disabled={object.objectType === 'SN'} inputProps={{ min: 0, step: 'any' }} error={invalidQuantity} helperText={max === null ? '正在读取可分配数量' : `本批次最多可调整为 ${max}；工单计划数量保持不变`} onChange={e => setForm({ ...form, targetQuantity: e.target.value })} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField label="计划开始时间" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.plannedStartAt} onChange={e => setForm({ ...form, plannedStartAt: e.target.value })} />
        <TextField label="计划结束时间" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.plannedEndAt} error={invalidDates} helperText={invalidDates ? '不能早于开始时间' : undefined} onChange={e => setForm({ ...form, plannedEndAt: e.target.value })} />
      </Box>
      <TextField label="备注" multiline minRows={2} value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} />
      {save.isError && <Alert severity="error">{save.error.message}</Alert>}
    </Stack></DialogContent>
    <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose} disabled={save.isPending}>取消</Button><Button variant="contained" disabled={save.isPending || !order.data || invalidQuantity || invalidDates || !form.processVersionId} onClick={() => save.mutate()}>{save.isPending ? '保存中…' : '保存修改'}</Button></DialogActions>
  </AppDialog>;
}
