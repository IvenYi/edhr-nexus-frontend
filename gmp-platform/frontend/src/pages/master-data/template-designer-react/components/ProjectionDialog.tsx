import { useEffect, useState } from 'react';
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import AppDialog from '@/components/AppDialog';
import client from '@/api/client';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ModelField, ProjectionBinding } from '../types/model';

interface Catalog { version: string; models: { id: string; name: string; attributes: { id: string; name: string; type: string }[] }[]; notice: string }
interface PreviewRecord { bindingId: string; rowKey: string; attributes: Record<string, unknown>; sources: Record<string, string> }
const base = '/master-data/template-modeling';

export default function ProjectionDialog({ open, onClose, onSave, onPublish, published, focusField }: {
  open: boolean; onClose: () => void; onSave: () => Promise<void>; onPublish: () => Promise<void>; published: boolean;
  focusField?: { id: string; name: string; tableId?: string } | null;
}) {
  const document = useTemplateDesignerStore(state => state.document);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [samples, setSamples] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<PreviewRecord[] | null>(null);
  const [newModel, setNewModel] = useState('formTrace');
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
    useTemplateDesignerStore.setState(state => ({ document: state.document ? {
      ...state.document, model: { ...state.document.model, projection: { version: catalog?.version ?? 'form-projection-v1', bindings: next } },
    } : null }));
  };
  const change = (id: string, patch: Partial<ProjectionBinding>) => update(bindings.map(binding => binding.id === id ? { ...binding, ...patch } : binding));
  const sources = (binding: ProjectionBinding): ModelField[] => binding.tableId
    ? (fields.find(field => field.id === binding.tableId)?.typeConfig.columns as ModelField[] ?? []) : fields;
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
      <Stack spacing={2.5}>
        <Typography color="text.secondary">选择要查找的信息及来源字段。每项用途保留一组对应关系；没有追溯需求的表单可以不配置。</Typography>
        {focusField && <Alert severity="info">正在配置字段「{focusField.name}」。下方编辑的是全表共用配置；来源选项标有“当前字段”。</Alert>}
        <Alert severity="info">{catalog?.notice ?? '正在读取可用用途…'} 数量与单位需完整配置；正式结果只在最终完成后生成。</Alert>
        {published && <Alert severity="success">此版本已发布冻结。修改来源或表单设计需创建新版本。</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {bindings.map((binding, index) => {
          const available = sources(binding).filter(field => field.status !== 'disabled');
          const model = catalog?.models.find(item => item.id === binding.modelId);
          const attributes = model?.attributes ?? [];
          return <Box key={binding.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontWeight={600}>用途 {index + 1} · {model?.name ?? binding.modelId}</Typography>
              <Stack direction="row"><FormControlLabel label={binding.enabled ? '启用' : '停用'} control={<Switch disabled={published || busy} checked={binding.enabled} onChange={(_, enabled) => change(binding.id, { enabled })} />} />
                <Button disabled={published || busy} color="error" onClick={() => update(bindings.filter(item => item.id !== binding.id))}>移除</Button></Stack>
            </Stack>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField select size="small" label="来源区域" value={binding.tableId || '__main'} disabled={published || busy}
                onChange={event => change(binding.id, { tableId: event.target.value === '__main' ? '' : event.target.value, rowKeyFieldId: '', sources: {} })}>
                <MenuItem value="__main">普通字段（本组一条）</MenuItem>
                {fields.filter(field => field.type === 'subTable').map(field => <MenuItem key={field.id} value={field.id}>{field.name}（每行一条）</MenuItem>)}
              </TextField>
              {binding.tableId && <TextField select size="small" label="明细记录键（每行唯一、改版后保持不变）" value={binding.rowKeyFieldId ?? ''} disabled={published || busy}
                onChange={event => change(binding.id, { rowKeyFieldId: event.target.value })}>
                <MenuItem value="">请选择</MenuItem>{available.map(field => <MenuItem key={field.id} value={field.id}>{field.name}</MenuItem>)}
              </TextField>}
              {attributes.map(attribute => <Stack key={attribute.id} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select fullWidth size="small" label={attribute.name} value={binding.sources[attribute.id] ?? ''} disabled={published || busy}
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
            </Stack>
          </Box>;
        })}
        <Stack direction="row" spacing={2}>
          <TextField select size="small" fullWidth label="添加用途" value={newModel} onChange={event => setNewModel(event.target.value)}>
            {(catalog?.models ?? []).map(model => <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>)}
          </TextField>
          <Button variant="outlined" sx={{ flexShrink: 0 }} disabled={!catalog || published || busy} onClick={() => update([...bindings, { id: crypto.randomUUID(), modelId: newModel, enabled: true, tableId: focusField?.tableId, sources: {} }])}>添加用途</Button>
        </Stack>
        {preview && <Box aria-live="polite"><Typography fontWeight={600}>预览：{preview.length} 条命中记录</Typography>
          <Typography variant="body2" color="text.secondary">仅使用上方模拟值，每个子表预览一行；不会保存正式结果。</Typography>
          {preview.map(record => <Box key={`${record.bindingId}/${record.rowKey}`} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2">用途 {bindings.findIndex(binding => binding.id === record.bindingId) + 1} · {record.rowKey === 'form' ? '普通字段组' : `明细 ${record.rowKey}`}</Typography>
            {Object.entries(record.attributes).map(([id, value]) => <Typography key={id} variant="body2">{catalog?.models.flatMap(model => model.attributes).find(attribute => attribute.id === id)?.name}: {typeof value === 'object' && value ? String((value as { name: string }).name) : String(value)}</Typography>)}
          </Box>)}</Box>}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>关闭</Button>
      <Button disabled={busy || !catalog} onClick={() => void run(showPreview)}>校验并预览</Button>
      <Button disabled={busy || published} onClick={() => void run(onSave)}>保存草稿</Button>
      <Button variant="contained" disabled={busy || published || !catalog} onClick={() => void run(onPublish)}>发布并冻结此版本</Button>
    </DialogActions>
  </AppDialog>;
}
