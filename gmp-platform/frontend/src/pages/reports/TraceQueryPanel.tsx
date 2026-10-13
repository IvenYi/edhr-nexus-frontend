import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Autocomplete, Box, Button, Collapse, IconButton, MenuItem, Stack, Tab, Tabs, TextField, Tooltip } from '@mui/material';
import { Add, DeleteOutline, ExpandMore, InfoOutlined, RestartAlt, Search } from '@mui/icons-material';
import client from '@/api/client';
import { useFormLookupItems } from '@/api/formLookupCatalog';
import { formListFieldSx, formListFilterActionsSx, formListQueryGridSx, formListQueryPanelSx } from '@/pages/form-management/formManagementListStyles';

export interface TraceRequest { direction: 'FORWARD' | 'REVERSE'; properties: Record<string, string>; filters: Record<string, string>; page: number; size: number }
export const initialTraceRequest: TraceRequest = { direction: 'FORWARD', properties: {}, filters: {}, page: 0, size: 20 };
const queryGridSx = { ...formListQueryGridSx, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } };

export function ProductionObjectInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const options = useQuery({ queryKey: ['projection-production-object-options', value], queryFn: async () =>
    (await client.get('/reports/form-projections/production-object-options', { params: { keyword: value } })).data.data as { id: string; code: string; name: string; type: string }[] });
  return <Autocomplete fullWidth freeSolo options={options.data ?? []} inputValue={value} loading={options.isFetching}
    getOptionLabel={option => typeof option === 'string' ? option : option.code}
    onInputChange={(_, text) => onChange(text)} onChange={(_, option) => onChange(typeof option === 'string' ? option : option?.code ?? '')}
    renderOption={(props, option) => <li {...props} key={option.id}>{option.code} · {option.type === 'SN' ? 'SN' : '批次'}</li>}
    renderInput={params => <TextField {...params} size="small" label={label} placeholder="请输入批次号或SN" sx={formListFieldSx} error={options.isError} helperText={options.isError ? '候选读取失败，可输入完整编号查询' : undefined} />} />;
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
  const builtinItems = items.filter(item => item.builtin);
  const customItems = items.filter(item => !item.builtin);
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
    : <TextField fullWidth size="small" label={label} placeholder="请输入" value={value} onChange={event => change(event.target.value)} sx={formListFieldSx} />;
  const property = (id: string, label: string) => id === 'objectNo'
    ? <ProductionObjectInput key={id} label={label} value={properties[id] ?? ''} onChange={value => setProperties({ ...properties, [id]: value })} />
    : <TextField key={id} fullWidth size="small" label={label} placeholder={options[id] ? '请选择' : '请输入'} select={Boolean(options[id])} type={id.includes('Date') ? 'date' : 'text'} InputLabelProps={id.includes('Date') ? { shrink: true } : undefined}
      value={properties[id] ?? ''} onChange={event => setProperties({ ...properties, [id]: event.target.value })} sx={formListFieldSx}>
      {options[id] && [<MenuItem key="all" value="">全部</MenuItem>, ...options[id].map(([value, name]) => <MenuItem key={value} value={value}>{name}</MenuItem>)]}
    </TextField>;
  const builtin = (item: typeof items[number]) => <Box key={item.id}>{lookup(item.id, `记录中的${item.name}`, filters[item.id] ?? '', value => setFilters({ ...filters, [item.id]: value }))}</Box>;
  const actions = <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ ...formListFilterActionsSx, gridColumn: expanded ? '1 / -1' : { xs: '1 / -1', lg: 'auto' } }}>
    <Button size="small" variant="outlined" startIcon={<RestartAlt />} onClick={() => { setProperties({}); setFilters({}); setConditions([]); setError(''); onSearch({ ...initialTraceRequest, direction, size }); }} sx={{ height: 40, width: 80, minWidth: 80 }}>重置</Button>
    <Button size="small" variant="contained" type="submit" startIcon={<Search />} sx={{ height: 40, width: 80, minWidth: 80 }}>查询</Button>
    <Button size="small" variant="text" endIcon={<ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />} onClick={() => setExpanded(!expanded)} aria-expanded={expanded} sx={{ height: 40, minWidth: 72, px: 1, color: '#1890ff', '&:hover': { bgcolor: '#f5faff' } }}>{expanded ? '收起' : '展开'}</Button>
  </Stack>;
  return <Box sx={{ ...formListQueryPanelSx, p: 0, flexShrink: 0 }}>
    <Stack direction="row" alignItems="center" sx={{ borderBottom: '1px solid #ebeef5' }}><Tabs value={direction} aria-label="追溯方向" onChange={(_, next: TraceRequest['direction']) => {
      setDirection(next); setProperties({}); setFilters({}); setConditions([]); setError(''); onSearch({ ...initialTraceRequest, direction: next, size });
    }} sx={{ flex: 1, px: 2, minHeight: 48 }}><Tab value="FORWARD" label="正向追溯" /><Tab value="REVERSE" label="反向追溯" /></Tabs>
      <Tooltip title={direction === 'FORWARD' ? '按真实关联的工单、产品、生产对象等属性查找；无需配置字段追溯用途。' : dhr ? '按已保存的绑定内容查找。各条件可出现在同一DHR的不同表单中，命中不改变真实归属。' : '按已保存的绑定内容查找。条件在同一表单满足，子表条件须在同一实际行满足。'}><IconButton size="small" sx={{ mr: 2 }} aria-label="追溯方向说明"><InfoOutlined fontSize="small" /></IconButton></Tooltip>
    </Stack>
    <Box component="form" onSubmit={event => { event.preventDefault(); submit(); }} sx={{ p: 2 }}>
      <Box sx={queryGridSx}>
        {direction === 'FORWARD' ? <>{property('objectNo', '所属生产批次/SN')}{property('workOrderNo', '所属工单编号')}</> : builtinItems.slice(0, 2).map(builtin)}
        {expanded ? direction === 'FORWARD' ? property('productCode', '产品编码') : builtinItems.slice(2, 3).map(builtin) : actions}
        {direction === 'REVERSE' && <>
          {builtinItems.slice(expanded ? 3 : 2).map(builtin)}
          {conditions.map(condition => <Box key={condition.id} sx={{ ...queryGridSx, gridColumn: '1 / -1', gridTemplateColumns: { xs: 'minmax(0, 1fr) 30px', sm: 'repeat(2, minmax(0, 1fr)) 30px', lg: 'repeat(3, minmax(0, 1fr))' } }}>
            <TextField fullWidth select size="small" label="追溯项" value={condition.itemId} sx={{ ...formListFieldSx, gridColumn: { xs: '1 / -1', sm: 'auto' } }} onChange={event => setConditions(conditions.map(item => item.id === condition.id ? { ...item, itemId: event.target.value, value: '' } : item))}>
              <MenuItem value="">请选择</MenuItem>{customItems.filter(item => !conditions.some(other => other.id !== condition.id && other.itemId === item.id)).map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
            </TextField>
            {lookup(condition.itemId, '精确匹配值', condition.value, value => setConditions(conditions.map(item => item.id === condition.id ? { ...item, value } : item)))}
            <Tooltip title="移除条件"><IconButton size="small" aria-label="移除条件" sx={{ justifySelf: 'start' }} onClick={() => setConditions(conditions.filter(item => item.id !== condition.id))}><DeleteOutline fontSize="small" /></IconButton></Tooltip>
          </Box>)}
          <Button size="small" startIcon={<Add />} disabled={catalog.isError || conditions.length >= customItems.length} sx={{ justifySelf: 'start', gridColumn: '1 / -1' }} onClick={() => setConditions([...conditions, { id: crypto.randomUUID(), itemId: '', value: '' }])}>添加查询条件</Button>
        </>}
        <Collapse in={expanded} timeout={180} unmountOnExit sx={{ gridColumn: '1 / -1' }}><Box sx={queryGridSx}>
          {direction === 'REVERSE' && <>{property('objectNo', '所属生产批次/SN')}{property('workOrderNo', '所属工单编号')}</>}
          {fixed.filter(([id]) => direction === 'REVERSE' || id !== 'productCode').map(([id, label]) => property(id, label))}
        </Box></Collapse>
        {expanded ? actions : null}
      </Box>
      {(error || direction === 'REVERSE' && catalog.isError) && <Alert severity="error" sx={{ mt: 1 }}>{error || '追溯项目录读取失败，请重试。'}{catalog.isError && <Button onClick={() => void catalog.refetch()}>重试</Button>}</Alert>}
    </Box>
  </Box>;
}
