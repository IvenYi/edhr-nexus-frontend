import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FormDialog from './FormDialog';
import FormDialogSection from './FormDialogSection';
import FormDialogFieldGrid from './FormDialogFieldGrid';
import { getWorkOrder, listProcessOptions, updateProductionObject, type ProductionObject } from '@/api/work-orders';

export default function ProductionObjectEditDialog({ object, onClose }: { object: ProductionObject; onClose: () => void }) {
  const client = useQueryClient();
  const [form, setForm] = useState({ processVersionId: object.processVersionId, targetQuantity: String(object.targetQuantity), remark: object.remark || '', plannedStartAt: object.plannedStartAt?.slice(0, 16) || '', plannedEndAt: object.plannedEndAt?.slice(0, 16) || '' });
  const options = useQuery({ queryKey: ['production-process-options', object.workOrderId], queryFn: async () => (await listProcessOptions(object.workOrderId)).data.data });
  const order = useQuery({ queryKey: ['work-order', object.workOrderId], queryFn: async () => (await getWorkOrder(object.workOrderId)).data.data });
  const quantitiesReady = [order.data?.plannedQuantity, order.data?.allocatedQuantity, object.targetQuantity]
    .every(value => value !== null && value !== undefined && Number.isFinite(Number(value)));
  const max = quantitiesReady ? Math.round((Number(order.data!.plannedQuantity) - Number(order.data!.allocatedQuantity) + Number(object.targetQuantity)) * 10000) / 10000 : null;
  const incompleteData = (order.isSuccess && !quantitiesReady) || (options.data ?? []).some(item => !item.processReference?.ownerName);
  const loading = order.isFetching || options.isFetching;
  const dataReady = !loading && order.isSuccess && options.isSuccess && !incompleteData && max !== null;
  const quantity = Number(form.targetQuantity);
  const invalidQuantity = !Number.isFinite(quantity) || quantity <= 0 || (max !== null && quantity > max);
  const invalidDates = Boolean(form.plannedStartAt && form.plannedEndAt && form.plannedEndAt < form.plannedStartAt);
  const save = useMutation({
    mutationFn: () => updateProductionObject(object.id, { ...form, targetQuantity: quantity, plannedStartAt: form.plannedStartAt || null, plannedEndAt: form.plannedEndAt || null }),
    onSuccess: async () => { await Promise.all([['production-objects'], ['work-orders'], ['work-order'], ['production-batches'], ['production-batch-audit'], ['production-execution']].map(queryKey => client.invalidateQueries({ queryKey }))); onClose(); },
  });
  return <FormDialog open onClose={() => !save.isPending && onClose()} maxWidth="sm" fullWidth>
    <DialogTitle>修改批次配置 · {object.objectNo}</DialogTitle>
    <DialogContent dividers><Stack spacing={1.5}>
      <Typography variant="body2" color="text.secondary">开工时冻结所选制程的实际配置。当前生产形态：{object.objectType === 'SN' ? 'SN' : '批次'}。</Typography>
      {(options.isError || order.isError || incompleteData) && <Alert severity="error">{incompleteData ? '制程或数量数据不完整，暂时无法保存。请确认服务已更新后重试。' : '制程或工单加载失败，请重试。'}<Button size="small" onClick={() => { void options.refetch(); void order.refetch(); }}>重试</Button></Alert>}
      <FormDialogSection title="批次配置"><Stack spacing={1.5}>
      <TextField select size="small" fullWidth label="制程版本" value={form.processVersionId} disabled={loading || incompleteData || options.isError} onChange={e => setForm({ ...form, processVersionId: e.target.value })}>
        {!(options.data ?? []).some(item => item.id === object.processVersionId) && <MenuItem value={object.processVersionId}>{object.processVersion}（当前引用，保存及开工时校验）</MenuItem>}
        {(options.data ?? []).map(item => <MenuItem key={item.id} value={item.id}>{[item.version, item.processReference?.ownerName].filter(Boolean).join(' · ')}{item.processReference?.ownerType === 'PRODUCT_FAMILY' ? '（产品簇）' : ''}</MenuItem>)}
      </TextField>
      <TextField required size="small" label="目标数量" type="number" value={form.targetQuantity} disabled={object.objectType === 'SN' || !dataReady} inputProps={{ min: 0, step: 'any' }} error={invalidQuantity} helperText={max === null ? (loading ? '正在读取可分配数量' : '可分配数量暂不可用') : `本批次最多可调整为 ${max}；工单计划数量保持不变`} onChange={e => setForm({ ...form, targetQuantity: e.target.value })} />
      </Stack></FormDialogSection>
      <FormDialogSection title="计划信息"><FormDialogFieldGrid>
        <TextField size="small" label="计划开始时间" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.plannedStartAt} onChange={e => setForm({ ...form, plannedStartAt: e.target.value })} />
        <TextField size="small" label="计划结束时间" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.plannedEndAt} error={invalidDates} helperText={invalidDates ? '不能早于开始时间' : undefined} onChange={e => setForm({ ...form, plannedEndAt: e.target.value })} />
      </FormDialogFieldGrid></FormDialogSection>
      <TextField size="small" label="备注" multiline minRows={2} value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} />
      {save.isError && <Alert severity="error">{save.error.message}</Alert>}
    </Stack></DialogContent>
    <DialogActions><Button onClick={onClose} disabled={save.isPending}>取消</Button><Button variant="contained" disabled={save.isPending || !dataReady || invalidQuantity || invalidDates || !form.processVersionId} onClick={() => save.mutate()}>{save.isPending ? '保存中…' : '保存修改'}</Button></DialogActions>
  </FormDialog>;
}
