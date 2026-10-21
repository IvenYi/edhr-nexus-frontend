import { useQuery } from '@tanstack/react-query';
import { Autocomplete, Button, Checkbox, Chip, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { getReferenceMaterialTypes } from '@/api/form-references';
import { referenceEditorSource, referenceMaterialScope, referenceProductionScope } from '@/components/form-renderer/referencePresentation';

export default function ReferenceScopeConfig({ config, onChange }: {
  config: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const source = referenceEditorSource(String(config.sourceType));
  const materialScope = referenceMaterialScope(config);
  const types = useQuery({ queryKey: ['reference-material-types'], queryFn: getReferenceMaterialTypes, enabled: source === 'material' && materialScope === 'types' });
  const ids = Array.isArray(config.referenceMaterialTypeIds) ? config.referenceMaterialTypeIds as string[] : [];
  const availableTypes = types.data ?? [];
  const allSelected = availableTypes.length > 0 && availableTypes.every(item => ids.includes(item.id));
  const partlySelected = !allSelected && availableTypes.some(item => ids.includes(item.id));
  if (source === 'productionObject') return <TextField select fullWidth size="small" label="候选范围" value={referenceProductionScope(config)} onChange={event => onChange({ referenceSourceType: 'productionObject', referenceProductionScope: event.target.value })}>
    <MenuItem value="all">批次和SN</MenuItem><MenuItem value="batch">仅生产批次</MenuItem><MenuItem value="sn">仅生产SN</MenuItem>
  </TextField>;
  if (source !== 'material') return null;
  return <Stack spacing={1}>
    <TextField select fullWidth size="small" label="允许选择的物料" value={materialScope} onChange={event => onChange({ referenceSourceType: 'material', referenceMaterialScope: event.target.value, ...(event.target.value === 'product' ? {} : { referenceContextAutofill: false }) })}>
      <MenuItem value="all">全部物料（不限类型）</MenuItem><MenuItem value="product">仅产品（产成品、半成品）</MenuItem><MenuItem value="types">指定物料类型</MenuItem>
    </TextField>
    <Typography variant="caption" color="text.secondary">{materialScope === 'all' ? '包含所有有效物料，以后新增的物料类型也会包含。' : materialScope === 'product' ? '只允许产成品和半成品；可配置自动带入当前产品。' : '只允许下方选中的类型，后续新增类型需手动加入。'}</Typography>
    {materialScope === 'types' && <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <FormControlLabel sx={{ m: 0 }} control={<Checkbox size="small" sx={{ p: 0.5 }} checked={allSelected} indeterminate={partlySelected} inputProps={{ 'aria-checked': partlySelected ? 'mixed' : allSelected }} disabled={!availableTypes.length || types.isFetching} onChange={(_, checked) => onChange({ referenceMaterialTypeIds: checked ? availableTypes.map(item => item.id) : [] })} />} label={<Typography variant="caption">全选当前类型</Typography>} />
        <Typography variant="caption" color="text.secondary">已选 {ids.length} 种</Typography>
        <Button size="small" sx={{ minWidth: 32, px: 0.5 }} disabled={!ids.length} onClick={() => onChange({ referenceMaterialTypeIds: [] })}>清空</Button>
      </Stack>
      <Autocomplete multiple disableCloseOnSelect size="small" options={(types.data ?? []).map(item => item.id)} value={ids}
        getOptionLabel={id => { const item = types.data?.find(type => type.id === id); return item ? `${item.name} [${item.code}]` : `不适用类型 [${id}]`; }}
        loading={types.isFetching} onChange={(_, values) => onChange({ referenceMaterialTypeIds: values })}
        openText="展开类型" closeText="收起类型" clearText="清空类型" loadingText="正在读取物料类型…"
        ListboxProps={{ style: { maxHeight: 280 } }}
        renderOption={(props, id, { selected }) => { const { key: _key, ...optionProps } = props as typeof props & { key?: React.Key }; const item = types.data?.find(type => type.id === id); return <li key={id} {...optionProps}><Checkbox size="small" checked={selected} tabIndex={-1} aria-hidden="true" sx={{ p: 0.5, mr: 0.5, pointerEvents: 'none' }} /><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{item?.name} [{item?.code}]</Typography></li>; }}
        renderTags={(values, getTagProps) => values.map((id, index) => { const { key, ...tagProps } = getTagProps({ index }); const item = types.data?.find(type => type.id === id); return <Chip key={key} {...tagProps} size="small" label={item?.name ?? `失效类型 ${id}`} title={item ? `${item.name} [${item.code}]` : `不适用类型 [${id}]`} />; })}
        noOptionsText={types.isError ? '类型读取失败' : types.data?.length ? '没有匹配的物料类型' : '暂无启用的物料类型'}
        renderInput={params => <TextField {...params} label="物料类型" placeholder="搜索并勾选类型" error={!ids.length || !types.isPending && ids.some(id => !types.data?.some(type => type.id === id))} helperText={!ids.length ? '请至少选择一种物料类型。' : '可连续勾选；点击外部或按 Esc 收起。'} />} />
      {types.isError && <Button size="small" onClick={() => types.refetch()}>重试读取类型</Button>}
    </>}
  </Stack>;
}
