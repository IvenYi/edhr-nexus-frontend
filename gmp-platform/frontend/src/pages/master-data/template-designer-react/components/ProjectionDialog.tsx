import { useEffect, useState } from 'react';
import { Alert, Box, Button, Collapse, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import AppDialog from '@/components/AppDialog';
import client from '@/api/client';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ModelField, ProjectionBinding } from '../types/model';

interface Catalog { version: string; models: { id: string; name: string; attributes: { id: string; name: string; type: string }[] }[]; notice: string }
interface PreviewRecord { bindingId: string; rowKey: string; attributes: Record<string, unknown>; sources: Record<string, string> }
const base = '/master-data/template-modeling';

export default function ProjectionDialog({ open, onClose, onSave, focusField }: {
  open: boolean; onClose: () => void; onSave: () => Promise<void>;
  focusField?: { id: string; name: string; tableId?: string } | null;
}) {
  const document = useTemplateDesignerStore(state => state.document);
  const setProjectionBindings = useTemplateDesignerStore(state => state.setProjectionBindings);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [samples, setSamples] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<PreviewRecord[] | null>(null);
  const [newModel, setNewModel] = useState('formTrace');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [materials, setMaterials] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (open) void client.get(`${base}/projection-catalog`).then(response => setCatalog(response.data.data as Catalog))
      .catch((reason: Error) => setError(reason.message));
  }, [open]);
  useEffect(() => {
    if (open) void client.post(`${base}/reference-options`, { config: { sourceType: 'material' }, keyword: '', values: {} })
      .then(response => setMaterials(response.data.data as { id: string; name: string }[])).catch(() => setMaterials([]));
  }, [open]);
  if (!document) return null;
  const bindings = document.model.projection?.bindings ?? [];
  const fields = document.model.fields;
  const update = (next: ProjectionBinding[]) => {
    setPreview(null);
    setProjectionBindings(next, catalog?.version);
  };
  const change = (id: string, patch: Partial<ProjectionBinding>) => update(bindings.map(binding => binding.id === id ? { ...binding, ...patch } : binding));
  const sources = (binding: ProjectionBinding): ModelField[] => binding.tableId
    ? (fields.find(field => field.id === binding.tableId)?.typeConfig.columns as ModelField[] ?? []) : fields;
  const sourceSummary = (binding: ProjectionBinding) => [...new Set(Object.values(binding.sources)
    .map(id => sources(binding).find(field => field.id === id)?.name ?? id))].join('、') || '尚未配置来源';
  const run = async (action: () => Promise<void>) => {
    setError(''); setBusy(true);
    try { await action(); } catch (reason) { setError(reason instanceof Error ? reason.message : '操作失败'); } finally { setBusy(false); }
  };
  const showPreview = async () => {
    const values: Record<string, unknown> = {};
    bindings.forEach(binding => {
      const row: Record<string, unknown> = {};
      Object.entries(binding.sources).forEach(([attribute, id]) => {
        const sample = samples[`${binding.tableId ?? ''}/${id}`] ?? '';
        const type = catalog?.models.find(model => model.id === binding.modelId)?.attributes.find(item => item.id === attribute)?.type;
        row[id] = type === 'number' ? (sample === '' ? null : Number(sample)) : type === 'reference' ? materials.find(material => material.id === sample) ?? null : sample;
      });
      if (binding.tableId) {
        if (binding.rowKeyFieldId) row[binding.rowKeyFieldId] = samples[`${binding.tableId}/${binding.rowKeyFieldId}`] ?? '';
        values[binding.tableId] = [{ ...(values[binding.tableId] as Record<string, unknown>[] | undefined)?.[0], ...row }];
      } else Object.assign(values, row);
    });
    const response = await client.post(`${base}/projection-preview`, { model: document.model, values });
    setPreview(response.data.data as PreviewRecord[]);
  };
  return <AppDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>追溯与统计</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={1.5}>
        <Typography color="text.secondary">先核对每项结果使用了哪些字段；需要调整来源或输入模拟值时，再展开相应明细。画布左侧“字段配置 → 数据用途”也能逐个设置。</Typography>
        {focusField && <Alert severity="info">正在配置字段「{focusField.name}」。下方编辑的是全表共用配置；来源选项标有“当前字段”。</Alert>}
        <Alert severity="info">左列选来源字段，会随模板保存；右列“模拟值”仅用于下方预览，不会写入模板或正式报表。{catalog?.notice ?? '正在读取可用用途…'} 数量与单位需完整配置；正式结果只在最终完成后生成。</Alert>
        {error && <Alert severity="error">{error}</Alert>}
        {bindings.map((binding) => {
          const available = sources(binding).filter(field => field.status !== 'disabled');
          const model = catalog?.models.find(item => item.id === binding.modelId);
          const attributes = model?.attributes ?? [];
          return <Box key={binding.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={600}>{model?.name ?? binding.modelId} · {binding.enabled ? '已启用' : '未启用'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{sourceSummary(binding)}</Typography>
              </Box>
              <Button size="small" sx={{ flexShrink: 0 }} onClick={() => setExpandedId(expandedId === binding.id ? null : binding.id)}>{expandedId === binding.id ? '收起' : '编辑 / 预览'}</Button>
            </Stack>
            <Collapse in={expandedId === binding.id} unmountOnExit><Stack spacing={2} sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="flex-end"><FormControlLabel label={binding.enabled ? '启用' : '停用'} control={<Switch disabled={busy} checked={binding.enabled} onChange={(_, enabled) => change(binding.id, { enabled })} />} />
                <Button disabled={busy} color="error" onClick={() => update(bindings.filter(item => item.id !== binding.id))}>移除</Button></Stack>
              <Stack direction="row" spacing={2}><Typography variant="caption" sx={{ flex: 1 }}>来源字段（保存）</Typography><Typography variant="caption" sx={{ flex: 1 }}>模拟值（仅预览）</Typography></Stack>
              <TextField select size="small" label="来源区域" value={binding.tableId || '__main'} disabled={busy}
                onChange={event => change(binding.id, { tableId: event.target.value === '__main' ? '' : event.target.value, rowKeyFieldId: '', sources: {} })}>
                <MenuItem value="__main">普通字段（本组一条）</MenuItem>
                {fields.filter(field => field.type === 'subTable').map(field => <MenuItem key={field.id} value={field.id}>{field.name}（每行一条）</MenuItem>)}
              </TextField>
              {binding.tableId && <TextField select size="small" label="明细记录键（每行唯一、改版后保持不变）" value={binding.rowKeyFieldId ?? ''} disabled={busy}
                onChange={event => change(binding.id, { rowKeyFieldId: event.target.value })}>
                <MenuItem value="">请选择</MenuItem>{available.map(field => <MenuItem key={field.id} value={field.id}>{field.name}</MenuItem>)}
              </TextField>}
              {attributes.map(attribute => <Stack key={attribute.id} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select fullWidth size="small" label={attribute.name} value={binding.sources[attribute.id] ?? ''} disabled={busy}
                  onChange={event => { const next = { ...binding.sources }; if (event.target.value) next[attribute.id] = event.target.value; else delete next[attribute.id]; change(binding.id, { sources: next }); }}>
                  <MenuItem value="">不配置</MenuItem>
                  {binding.sources[attribute.id] && !available.some(field => field.id === binding.sources[attribute.id]) && <MenuItem value={binding.sources[attribute.id]}>来源失效，请重新选择</MenuItem>}
                  {available.filter(field => attribute.type === 'number' ? field.type === 'number' : attribute.type === 'reference'
                    ? field.type === 'reference' && field.typeConfig.sourceType === 'material' : ['text', 'singleSelect'].includes(field.type))
                    .map(field => <MenuItem key={field.id} value={field.id}>{field.name}{focusField?.id === field.id && (focusField.tableId ?? '') === (binding.tableId ?? '') ? '（当前字段）' : ''}</MenuItem>)}
                </TextField>
                <TextField fullWidth size="small" label={attribute.type === 'reference' ? '模拟选择物料' : '模拟填写值'} select={attribute.type === 'reference'}
                  type={attribute.type === 'number' ? 'number' : 'text'} disabled={!binding.sources[attribute.id] || busy}
                  value={samples[`${binding.tableId ?? ''}/${binding.sources[attribute.id]}`] ?? ''}
                  onChange={event => { setPreview(null); setSamples({ ...samples, [`${binding.tableId ?? ''}/${binding.sources[attribute.id]}`]: event.target.value }); }}>
                  {attribute.type === 'reference' ? [<MenuItem key="empty" value="">请选择</MenuItem>, ...materials.map(material => <MenuItem key={material.id} value={material.id}>{material.name}</MenuItem>)] : undefined}
                </TextField>
              </Stack>)}
              {binding.tableId && binding.rowKeyFieldId && <TextField size="small" label="模拟行记录键" value={samples[`${binding.tableId}/${binding.rowKeyFieldId}`] ?? ''}
                onChange={event => { setPreview(null); setSamples({ ...samples, [`${binding.tableId}/${binding.rowKeyFieldId}`]: event.target.value }); }} />}
            </Stack></Collapse>
          </Box>;
        })}
        {!isAdding ? <Button variant="outlined" onClick={() => setIsAdding(true)}>添加查询或业务记录</Button> : <Stack direction="row" spacing={2}>
          <TextField select size="small" fullWidth label="记录用途" value={newModel} onChange={event => setNewModel(event.target.value)}>
            {(catalog?.models ?? []).map(model => <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>)}
          </TextField>
          <Button variant="outlined" sx={{ flexShrink: 0 }} disabled={!catalog || busy} onClick={() => { const id = crypto.randomUUID(); update([...bindings, { id, modelId: newModel, enabled: false, tableId: focusField?.tableId, sources: {} }]); setExpandedId(id); setIsAdding(false); }}>添加记录</Button>
          <Button onClick={() => setIsAdding(false)}>取消</Button>
        </Stack>}
        {preview && <Box aria-live="polite"><Typography fontWeight={600}>预览：{preview.length} 条命中记录</Typography>
          <Typography variant="body2" color="text.secondary">仅使用上方模拟值，每个子表预览一行；不会保存正式结果。</Typography>
          {preview.map(record => <Box key={`${record.bindingId}/${record.rowKey}`} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2">来源明细 {bindings.findIndex(binding => binding.id === record.bindingId) + 1} · {record.rowKey === 'form' ? '普通字段组' : `明细 ${record.rowKey}`}</Typography>
            {Object.entries(record.attributes).map(([id, value]) => <Typography key={id} variant="body2">{catalog?.models.flatMap(model => model.attributes).find(attribute => attribute.id === id)?.name}: {typeof value === 'object' && value ? String((value as { name: string }).name) : String(value)}</Typography>)}
          </Box>)}</Box>}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>关闭</Button>
      <Button disabled={busy || !catalog} onClick={() => void run(showPreview)}>校验并预览</Button>
      <Button variant="contained" disabled={busy} onClick={() => void run(onSave)}>保存配置</Button>
    </DialogActions>
  </AppDialog>;
}
