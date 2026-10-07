import { useEffect, useState } from 'react';
import { Alert, Box, Button, Collapse, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import FormDialog from '@/components/FormDialog';
import FormDialogSection from '@/components/FormDialogSection';
import client from '@/api/client';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ModelField, ProjectionBinding } from '../types/model';
import { projectionConfigurationIssues, projectionSourceSummary, projectionSources, useProjectionCatalog, type ProjectionPreviewRecord } from '../utils/projectionConfiguration';
import { buildProjectionPreviewValues, previewSampleKey } from '../utils/projectionPreview';
import ProjectionSourceEditor from './ProjectionSourceEditor';
import FieldProjectionConfig from './FieldProjectionConfig';
import SubTableProjectionConfig from './SubTableProjectionConfig';

export default function ProjectionDialog({ open, onClose, onSave, focusField }: {
  open: boolean; onClose: () => void; onSave: () => Promise<void>;
  focusField?: { id: string; name: string; tableId?: string } | null;
}) {
  const document = useTemplateDesignerStore(state => state.document);
  const setBindings = useTemplateDesignerStore(state => state.setProjectionBindings);
  const { data: catalog, isPending, isError, refetch } = useProjectionCatalog();
  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [fieldId, setFieldId] = useState('');
  const [samples, setSamples] = useState<Record<string, string>>({});
  const [rowCounts, setRowCounts] = useState<Record<string, number>>({});
  const [preview, setPreview] = useState<ProjectionPreviewRecord[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { data: materials = [], isError: materialsError } = useQuery({
    queryKey: ['projection-preview-materials'], enabled: open && tab === 1,
    queryFn: async () => (await client.post('/master-data/template-modeling/reference-options', {
      config: { sourceType: 'material' }, keyword: '', values: {},
    })).data.data as { id: string; name: string }[],
  });
  useEffect(() => {
    if (!open) return;
    setTab(0); setError(''); setPreview(null); setExpandedId(null);
    setRegionId(focusField ? focusField.tableId ?? '' : null); setFieldId(focusField?.id ?? '');
  }, [open, focusField]);
  useEffect(() => setPreview(null), [document?.model.projection]);
  if (!document) return null;
  const bindings = document.model.projection?.bindings ?? [];
  const regions = [{ id: '', name: '主表字段' }, ...document.model.fields.filter(field => field.type === 'subTable').map(field => ({ id: field.id, name: field.name }))];
  const focusedTable = document.model.fields.find(field => field.id === regionId && field.type === 'subTable');
  const focusedField = projectionSources(document.model, { tableId: regionId ?? undefined } as ProjectionBinding).find(field => field.id === fieldId);
  const enabled = bindings.filter(binding => binding.enabled);
  const update = (next: ProjectionBinding[]) => setBindings(next, catalog?.version);
  const run = async (action: () => Promise<void>) => {
    setError(''); setBusy(true);
    try { await action(); } catch (reason) { setError(reason instanceof Error ? reason.message : '操作失败'); } finally { setBusy(false); }
  };
  const showPreview = async () => {
    setPreview(null);
    const response = await client.post('/master-data/template-modeling/projection-preview', {
      model: document.model, values: buildProjectionPreviewValues(document.model, samples, rowCounts, materials),
    });
    setPreview(response.data.data as ProjectionPreviewRecord[]);
  };
  const renderSample = (field: ModelField, tableId: string, rowIndex: number) => {
    const key = previewSampleKey(tableId, rowIndex, field.id);
    const material = field.type === 'reference';
    return <TextField key={key} size="small" fullWidth label={field.name} select={material} type={field.type === 'number' ? 'number' : 'text'}
      value={samples[key] ?? ''} onChange={event => { setPreview(null); setSamples({ ...samples, [key]: event.target.value }); }}>
      {material ? [<MenuItem key="empty" value="">请选择物料</MenuItem>, ...materials.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)] : undefined}
    </TextField>;
  };
  return <FormDialog open={open} onClose={() => { if (!busy) onClose(); }} maxWidth="md" fullWidth>
    <DialogTitle>查找与统计总览</DialogTitle>
    <Tabs value={tab} onChange={(_, value: number) => { setTab(value); setError(''); }} sx={{ px: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Tab label="用途配置" /><Tab label="模拟预览" />
    </Tabs>
    <DialogContent dividers>
      <Stack spacing={2}>
        {isPending && <Typography color="text.secondary">正在加载用途目录…</Typography>}
        {isError && <Alert severity="error" action={<Button onClick={() => void refetch()}>重试</Button>}>用途目录加载失败</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {tab === 0 ? <>
          <Typography variant="body2" color="text.secondary">日常配置可直接点选画布上的字段或子表，进入左侧“查找与统计”。这里用于核对全表用途；修改后统一保存。</Typography>
          {regions.map(region => {
            const items = bindings.filter(binding => (binding.tableId ?? '') === region.id);
            const trace = items.filter(binding => binding.modelId === 'formTrace');
            const statistics = items.filter(binding => binding.modelId !== 'formTrace');
            return <FormDialogSection key={region.id} title={region.name}>
              <Stack direction="row" justifyContent="flex-end" alignItems="center">
                <Button size="small" onClick={() => { setRegionId(regionId === region.id ? null : region.id); setFieldId(''); }}>{regionId === region.id ? '收起配置' : region.id ? '配置子表用途' : '选择字段配置'}</Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>查找与追溯：{trace.length ? trace.map(item => projectionSourceSummary(document.model, item)).join('；') : '未配置'}</Typography>
              <Typography variant="body2" color="text.secondary">业务统计：{statistics.length ? `${statistics.length} 项用途` : '未配置'}</Typography>
              {items.map(binding => {
                const definition = catalog?.models.find(model => model.id === binding.modelId);
                const issues = projectionConfigurationIssues(document.model, binding, definition);
                return <Box key={binding.id} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1.5, pt: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Box sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={600}>{definition?.name ?? '用途已失效'} · {binding.enabled ? '已启用' : '配置草稿'}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{projectionSourceSummary(document.model, binding)}</Typography>
                      {!!issues.length && <Typography variant="caption" color="warning.main" display="block">{issues.join('；')}</Typography>}
                    </Box>
                    <Button size="small" sx={{ flexShrink: 0 }} onClick={() => setExpandedId(expandedId === binding.id ? null : binding.id)}>{expandedId === binding.id ? '收起' : '调整来源'}</Button>
                  </Stack>
                  {definition && <Collapse in={expandedId === binding.id} unmountOnExit><Box sx={{ pt: 2 }}><ProjectionSourceEditor binding={binding} definition={definition}
                    onChange={patch => update(bindings.map(item => item.id === binding.id ? { ...item, ...patch } : item))}
                    onRemove={() => update(bindings.filter(item => item.id !== binding.id))} /></Box></Collapse>}
                </Box>;
              })}
              <Collapse in={regionId === region.id} unmountOnExit><Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2, pt: 2 }}>
                {region.id && focusedTable ? <SubTableProjectionConfig field={focusedTable} /> : <Stack spacing={2}>
                  <TextField select size="small" label="选择主表字段" value={fieldId} onChange={event => setFieldId(event.target.value)}>
                    <MenuItem value="">请选择</MenuItem>{document.model.fields.filter(field => field.type !== 'subTable' && ['text', 'number', 'singleSelect', 'reference'].includes(field.type)).map(field => <MenuItem key={field.id} value={field.id}>{field.name}</MenuItem>)}
                  </TextField>
                  {focusedField && <FieldProjectionConfig field={focusedField} />}
                </Stack>}
              </Box></Collapse>
            </FormDialogSection>;
          })}
        </> : <>
          <Alert severity="info">模拟填写只用于核对已启用的用途，不保存到模板或正式记录。子表可填写多行，核对每行是否形成正确明细。配置草稿不参与预览。</Alert>
          {!enabled.length && <Typography color="text.secondary">尚无已启用用途，请先在“用途配置”中补齐并启用。</Typography>}
          {materialsError && enabled.some(binding => binding.sources.material) && <Alert severity="warning">物料选项读取失败，请切换页面后重试。</Alert>}
          {regions.map(region => {
            const items = enabled.filter(binding => (binding.tableId ?? '') === region.id);
            if (!items.length) return null;
            const ids = new Set(items.flatMap(binding => [...Object.values(binding.sources), ...(binding.rowKeyFieldId ? [binding.rowKeyFieldId] : [])]));
            const fields = projectionSources(document.model, items[0]).filter(field => ids.has(field.id));
            const count = region.id ? rowCounts[region.id] ?? 2 : 1;
            return <FormDialogSection key={region.id} title={region.name}>
              {Array.from({ length: count }, (_, rowIndex) => <Box key={rowIndex} sx={{ mt: 2 }}>
                {region.id && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>第 {rowIndex + 1} 行</Typography>}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>{fields.map(field => renderSample(field, region.id, rowIndex))}</Box>
              </Box>)}
              {!!region.id && <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" disabled={count >= 10} onClick={() => { setPreview(null); setRowCounts({ ...rowCounts, [region.id]: count + 1 }); }}>添加模拟行</Button>
                <Button size="small" disabled={count <= 1} onClick={() => { setPreview(null); setRowCounts({ ...rowCounts, [region.id]: count - 1 }); }}>移除末行</Button>
              </Stack>}
            </FormDialogSection>;
          })}
          {preview && <Box aria-live="polite"><Typography fontWeight={600}>预览结果 · {preview.length} 条明细</Typography>
            {preview.map(record => {
              const binding = bindings.find(item => item.id === record.bindingId);
              const definition = catalog?.models.find(model => model.id === binding?.modelId);
              return <Box key={`${record.bindingId}/${record.rowKey}`} sx={{ mt: 1.5, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600}>{definition?.name} · {regions.find(region => region.id === (binding?.tableId ?? ''))?.name}{binding?.tableId ? ` · 行定位值 ${record.rowKey}` : ''}</Typography>
                {Object.entries(record.attributes).map(([id, value]) => {
                  const name = definition?.attributes.find(attribute => attribute.id === id)?.name;
                  return <Typography key={id} variant="body2">{binding?.modelId === 'formTrace' ? name ?? '追溯项已失效' : name?.replace(/（.*?）/g, '') ?? '业务信息已失效'}：{typeof value === 'object' && value ? String((value as { name: string }).name) : String(value)}</Typography>;
                })}
              </Box>;
            })}
          </Box>}
        </>}
      </Stack>
    </DialogContent>
    <DialogActions><Button disabled={busy} onClick={onClose}>关闭</Button>
      {tab === 1 && <Button disabled={busy || !catalog || !enabled.length} onClick={() => void run(showPreview)}>校验并预览</Button>}
      <Button variant="contained" disabled={busy || !catalog} onClick={() => void run(onSave)}>{busy ? '处理中…' : '保存配置'}</Button>
    </DialogActions>
  </FormDialog>;
}
