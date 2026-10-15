import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import FormDialog from '@/components/FormDialog';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import { projectionBindingLabel, projectionConfigurationIssues, projectionSourceSummary, useProjectionCatalog } from '../utils/projectionConfiguration';
import ProjectionSourceEditor from './ProjectionSourceEditor';
import ProjectionRemoveButton from './ProjectionRemoveButton';

/** Save feedback stays focused on the configurations that need attention. */
export default function ProjectionValidationDialog({ open, onClose, onSave, saving, focusBindingId }: {
  open: boolean; onClose: () => void; onSave: () => Promise<void>; saving: boolean; focusBindingId: string | null;
}) {
  const document = useTemplateDesignerStore(state => state.document);
  const setBindings = useTemplateDesignerStore(state => state.setProjectionBindings);
  const { data: catalog, isError, refetch } = useProjectionCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const bindings = document?.model.projection?.bindings ?? [];
  const entries = bindings.map(binding => ({ binding, definition: catalog?.models.find(model => model.id === binding.modelId),
    issues: catalog && document ? projectionConfigurationIssues(document.model, binding, catalog.models.find(model => model.id === binding.modelId)) : [],
  }));
  const invalid = entries.filter(entry => entry.issues.length);
  const invalidIds = invalid.map(entry => entry.binding.id).join(',');
  useEffect(() => {
    if (!open) { setReviewedIds([]); setSelectedId(null); return; }
    setSelectedId(focusBindingId);
  }, [open, focusBindingId]);
  useEffect(() => {
    if (open) setReviewedIds(previous => [...new Set([...previous, ...invalidIds.split(',').filter(Boolean)])]);
  }, [open, invalidIds]);
  const visible = entries.filter(entry => entry.issues.length || reviewedIds.includes(entry.binding.id));
  const selected = visible.find(entry => entry.binding.id === selectedId) ?? visible.find(entry => entry.issues.length) ?? visible[0];
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const target = editorRef.current?.querySelector<HTMLElement>('.Mui-error [role="combobox"], .Mui-error input') ?? editorRef.current;
      target?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, selected?.binding.id]);
  if (!document) return null;
  const regionName = (tableId?: string) => tableId ? document.model.fields.find(field => field.id === tableId)?.name ?? '已失效子表' : '主表';
  return <FormDialog open={open} onClose={() => { if (!saving) onClose(); }} maxWidth="md" fullWidth>
    <DialogTitle>完善用途配置</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={2}>
        {isError && <Alert severity="error" action={<Button onClick={() => void refetch()}>重试</Button>}>用途目录加载失败</Alert>}
        {catalog && !isError && <Alert severity={invalid.length ? 'warning' : 'success'} aria-live="polite">
          {invalid.length ? `有 ${invalid.length} 处配置需要处理，本次尚未保存。选择一项，补齐标红位置；不需要的配置可移除。` : '已补齐，可以保存。'}
        </Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '240px minmax(0, 1fr)' }, gap: 2, pointerEvents: saving ? 'none' : undefined }}
          onKeyDownCapture={event => { if (saving) event.preventDefault(); }}>
          <List aria-label="待处理用途配置" disablePadding sx={{ alignSelf: 'start', maxHeight: { xs: 180, sm: 420 }, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {visible.map(entry => <ListItemButton key={entry.binding.id} selected={selected?.binding.id === entry.binding.id} disabled={saving}
              onClick={() => setSelectedId(entry.binding.id)} sx={{ alignItems: 'flex-start' }}>
              <ListItemText primary={`${regionName(entry.binding.tableId)} / ${projectionBindingLabel(document.model, entry.binding, entry.definition)}`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600, sx: { overflowWrap: 'anywhere' } }}
                secondary={entry.issues.length ? entry.issues.join('；') : '已补齐'} secondaryTypographyProps={{ variant: 'caption', color: entry.issues.length ? 'text.secondary' : 'success.main' }} />
            </ListItemButton>)}
            {!visible.length && <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>没有待处理配置</Typography>}
          </List>
          {selected && <Box key={selected.binding.id} ref={editorRef} tabIndex={-1} sx={{ minWidth: 0, outline: 'none' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>{projectionBindingLabel(document.model, selected.binding, selected.definition)}</Typography>
              <ProjectionRemoveButton label={`移除${projectionBindingLabel(document.model, selected.binding, selected.definition)}配置`} onClick={() => setBindings(bindings.filter(binding => binding.id !== selected.binding.id), catalog?.version)} />
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>{projectionSourceSummary(document.model, selected.binding)}</Typography>
            {selected.definition ? <ProjectionSourceEditor key={selected.binding.id} binding={selected.binding} definition={selected.definition} showErrors
              onChange={patch => setBindings(bindings.map(binding => binding.id === selected.binding.id ? { ...binding, ...patch } : binding), catalog?.version)} />
              : <Alert severity="error">此用途已失效，请移除配置后返回设计器重新选择。</Alert>}
          </Box>}
        </Box>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button disabled={saving} onClick={onClose}>返回设计</Button>
      <Button variant="contained" disabled={saving || !catalog || isError || invalid.length > 0} onClick={() => void onSave()}>{saving ? '正在保存…' : '重新校验并保存'}</Button>
    </DialogActions>
  </FormDialog>;
}
