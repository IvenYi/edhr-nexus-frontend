import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Autocomplete, Box, Button, Collapse, IconButton, MenuItem, Stack, Tab, Tabs, TextField, Tooltip } from '@mui/material';
import { Add, DeleteOutline, ExpandLess, ExpandMore, InfoOutlined, Search } from '@mui/icons-material';
import client from '@/api/client';
import { useFormLookupItems } from '@/api/formLookupCatalog';
import { formListFieldSx, formListQueryGridSx, formListQueryPanelSx } from '@/pages/form-management/formManagementListStyles';

export interface TraceRequest { direction: 'FORWARD' | 'REVERSE'; properties: Record<string, string>; filters: Record<string, string>; page: number; size: number }
export const initialTraceRequest: TraceRequest = { direction: 'FORWARD', properties: {}, filters: {}, page: 0, size: 20 };
const commonItems = ['lookup_production_batch', 'materialLotText', 'equipmentText'];

export function ProductionObjectInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const options = useQuery({ queryKey: ['projection-production-object-options', value], queryFn: async () =>
    (await client.get('/reports/form-projections/production-object-options', { params: { keyword: value } })).data.data as { id: string; code: string; name: string; type: string }[] });
  return <Autocomplete freeSolo options={options.data ?? []} inputValue={value} loading={options.isFetching}
    getOptionLabel={option => typeof option === 'string' ? option : option.code}
    onInputChange={(_, text) => onChange(text)} onChange={(_, option) => onChange(typeof option === 'string' ? option : option?.code ?? '')}
    renderOption={(props, option) => <li {...props} key={option.id}>{option.code} · {option.type === 'SN' ? 'SN' : '批次'}</li>}
    renderInput={params => <TextField {...params} size="small" label={label} sx={formListFieldSx} error={options.isError} helperText={options.isError ? '候选读取失败，可输入完整编号查询' : undefined} />} />;
}

export default function TraceQueryPanel({ dhr = false, size, onSearch }: { dhr?: boolean; size: number; onSearch: (request: TraceRequest) => void }) {
  const [direction, setDirection] = useState<TraceRequest['direction']>('FORWARD');
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [conditions, setConditions] = useState<{ id: string; itemId: string; value: string }[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const catalog = useFormLookupItems(direction === 'REVERSE');
  const items = catalog.data ?? [];
  const fixed = dhr
    ? [['dhrNo', 'DHR编号'], ['productCode', '产品编码'], ['productName', '产品名称'], ['objectType', '生产对象类型'], ['status', '生产状态'], ['summaryStatus', '汇总状态'], ['createdBy', '创建人'], ['createdDateFrom', '创建日期自'], ['createdDateTo', '创建日期至']]
    : [['instanceNo', '表单流水号'], ['templateName', '表单名称'], ['productCode', '产品编码'], ['productName', '产品名称'], ['operationName', '工序名称'], ['status', '表单状态'], ['createdBy', '创建人'], ['createdDateFrom', '创建日期自'], ['createdDateTo', '创建日期至']];
  const options: Record<string, string[][]> = {
    objectType: [['BATCH', '批次'], ['SN', 'SN']],
    status: dhr ? [['IN_PROGRESS', '生产中'], ['COMPLETED', '已完成'], ['EARLY_TERMINATED', '提前结束']]
      : [['DRAFT', '草稿'], ['FILLING', '填报中'], ['APPROVAL', '审批中'], ['FILLING_AND_APPROVAL', '填报／审批中'], ['COMPLETED', '已完成']],
    summaryStatus: [['NOT_STARTED', '未汇总'], ['DRAFT', '汇总中'], ['PENDING_REVIEW', '待审核'], ['FORMALIZED', '已定版']],
  };
  const nonempty = (values: Record<string, string>) => Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim()).map(([key, value]) => [key, value.trim()]));
  const submit = () => {
    const content = nonempty(filters);
    for (const condition of conditions) {
      if (!condition.itemId || !condition.value.trim()) { setError('请选好追溯项并填写查询值，或移除空条件'); return; }
      content[condition.itemId] = condition.value.trim();
    }
    setError(''); onSearch({ direction, properties: nonempty(properties), filters: direction === 'REVERSE' ? content : {}, page: 0, size });
  };
  const lookup = (id: string, label: string, value: string, change: (value: string) => void) => id === 'lookup_production_batch'
    ? <ProductionObjectInput label={label} value={value} onChange={change} />
    : <TextField size="small" label={label} value={value} onChange={event => change(event.target.value)} sx={formListFieldSx} />;
  return <Box sx={{ ...formListQueryPanelSx, flexShrink: 0 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}><Tabs value={direction} aria-label="追溯方向" onChange={(_, next: TraceRequest['direction']) => {
      setDirection(next); setProperties({}); setFilters({}); setConditions([]); setError(''); onSearch({ ...initialTraceRequest, direction: next, size });
    }} sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}><Tab value="FORWARD" label="正向追溯" /><Tab value="REVERSE" label="反向追溯" /></Tabs>
      <Tooltip title={direction === 'FORWARD' ? '按真实关联的工单、产品、生产对象等属性查找；无需配置字段追溯用途。' : dhr ? '按已保存的绑定内容查找。各条件可出现在同一DHR的不同表单中，命中不改变真实归属。' : '按已保存的绑定内容查找。条件在同一表单满足，子表条件须在同一实际行满足。'}><IconButton aria-label="追溯方向说明"><InfoOutlined fontSize="small" /></IconButton></Tooltip>
    </Stack>
    <Box component="form" onSubmit={event => { event.preventDefault(); submit(); }}>
      <Box sx={formListQueryGridSx}>
        <ProductionObjectInput label="所属生产批次/SN" value={properties.objectNo ?? ''} onChange={value => setProperties({ ...properties, objectNo: value })} />
        <TextField size="small" label="所属工单编号" value={properties.workOrderNo ?? ''} onChange={event => setProperties({ ...properties, workOrderNo: event.target.value })} sx={formListFieldSx} />
        <TextField size="small" label="产品编码" value={properties.productCode ?? ''} onChange={event => setProperties({ ...properties, productCode: event.target.value })} sx={formListFieldSx} />
        <Collapse in={expanded} unmountOnExit sx={{ gridColumn: '1 / -1' }}><Box sx={formListQueryGridSx}>{fixed.filter(([id]) => id !== 'productCode').map(([id, label]) =>
          <TextField key={id} size="small" label={label} select={Boolean(options[id])} type={id.includes('Date') ? 'date' : 'text'} InputLabelProps={id.includes('Date') ? { shrink: true } : undefined}
            value={properties[id] ?? ''} onChange={event => setProperties({ ...properties, [id]: event.target.value })} sx={formListFieldSx}>
            {options[id] && [<MenuItem key="all" value="">全部</MenuItem>, ...options[id].map(([value, name]) => <MenuItem key={value} value={value}>{name}</MenuItem>)]}
          </TextField>)}</Box></Collapse>
        {direction === 'REVERSE' && <>
          {items.filter(item => commonItems.includes(item.id)).map(item => <Box key={item.id}>{lookup(item.id, `记录中的${item.name}`, filters[item.id] ?? '', value => setFilters({ ...filters, [item.id]: value }))}</Box>)}
          {conditions.map(condition => <Stack key={condition.id} direction="row" gap={1} sx={{ gridColumn: '1 / -1', alignItems: 'center' }}>
            <TextField select size="small" label="追溯项" value={condition.itemId} sx={{ ...formListFieldSx, flex: 1 }} onChange={event => setConditions(conditions.map(item => item.id === condition.id ? { ...item, itemId: event.target.value, value: '' } : item))}>
              <MenuItem value="">请选择</MenuItem>{items.filter(item => !commonItems.includes(item.id) && !conditions.some(other => other.id !== condition.id && other.itemId === item.id)).map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
            </TextField>
            <Box sx={{ flex: 1 }}>{lookup(condition.itemId, '精确匹配值', condition.value, value => setConditions(conditions.map(item => item.id === condition.id ? { ...item, value } : item)))}</Box>
            <Tooltip title="移除条件"><IconButton aria-label="移除条件" onClick={() => setConditions(conditions.filter(item => item.id !== condition.id))}><DeleteOutline fontSize="small" /></IconButton></Tooltip>
          </Stack>)}
          <Button startIcon={<Add />} disabled={catalog.isError || conditions.length >= items.filter(item => !commonItems.includes(item.id)).length} sx={{ justifySelf: 'start' }} onClick={() => setConditions([...conditions, { id: crypto.randomUUID(), itemId: '', value: '' }])}>添加追溯条件</Button>
        </>}
        <Stack direction="row" gap={1} justifyContent="flex-end" sx={{ gridColumn: '1 / -1' }}>
          <Button endIcon={expanded ? <ExpandLess /> : <ExpandMore />} onClick={() => setExpanded(!expanded)}>{expanded ? '收起筛选' : '更多筛选'}</Button>
          <Button variant="outlined" onClick={() => { setProperties({}); setFilters({}); setConditions([]); setError(''); onSearch({ ...initialTraceRequest, direction, size }); }}>重置</Button>
          <Button variant="contained" type="submit" startIcon={<Search />}>查询</Button>
        </Stack>
      </Box>
    </Box>
    {(error || direction === 'REVERSE' && catalog.isError) && <Alert severity="error" sx={{ mt: 1 }}>{error || '追溯项目录读取失败，请重试。'}{catalog.isError && <Button onClick={() => void catalog.refetch()}>重试</Button>}</Alert>}
  </Box>;
}
