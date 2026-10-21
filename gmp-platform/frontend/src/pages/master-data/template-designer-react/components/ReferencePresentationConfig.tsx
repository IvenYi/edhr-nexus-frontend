import { ArrowDownward, ArrowUpward, Close, InfoOutlined } from '@mui/icons-material';
import { Box, Checkbox, FormControlLabel, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { supportsReferenceContext, referenceDefaultSearchFields, referenceDisplayFields, referenceDisplayText } from '@/components/form-renderer/referencePresentation';

export default function ReferencePresentationConfig({ source, config, fields, onChange }: {
  source: string;
  config: Record<string, unknown>;
  fields: Array<{ label: string; value: string }>;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const selected = referenceDisplayFields({ ...config, sourceType: source });
  const searchFields = Array.isArray(config.referenceSearchFields) && config.referenceSearchFields.length ? config.referenceSearchFields as string[] : referenceDefaultSearchFields(source);
  const move = (index: number, offset: number) => {
    const next = [...selected];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange({ referenceDisplayFields: next });
  };
  const sample = { id: 'example', code: 'EX-001', name: '示例名称', displayName: '张三', username: 'zhangsan', specification: 'Φ5×300mm', unit: '件', model: 'UC-200', workOrderNo: 'WO-001', productCode: 'P-001', productName: '示例产品', description: '示例说明', value: 'EX-001', phone: '13800000000', email: 'example@example.com', parentName: '生产部', materialTypeName: '原材料', objectTypeName: '批次' };
  return <Stack spacing={1}>
    <Typography variant="caption" fontWeight={600}>默认显示内容</Typography>
    {selected.map((key, index) => <Stack key={key} direction="row" alignItems="center" sx={{ border: 1, borderColor: 'divider', borderRadius: 1, pl: 1 }}>
      <Typography variant="body2" sx={{ flex: 1 }}>{fields.find(item => item.value === key)?.label ?? key}</Typography>
      <Tooltip title="上移"><span><IconButton size="small" aria-label={`上移${key}`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUpward sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
      <Tooltip title="下移"><span><IconButton size="small" aria-label={`下移${key}`} disabled={index === selected.length - 1} onClick={() => move(index, 1)}><ArrowDownward sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
      <Tooltip title="移除"><span><IconButton size="small" aria-label={`移除显示字段${key}`} disabled={selected.length === 1} onClick={() => onChange({ referenceDisplayFields: selected.filter(item => item !== key) })}><Close sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
    </Stack>)}
    <TextField select size="small" fullWidth label="添加显示字段" value="" onChange={event => onChange({ referenceDisplayFields: [...selected, event.target.value] })}>
      {fields.filter(item => !selected.includes(item.value)).map(item => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
    </TextField>
    <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}><Typography variant="caption" color="text.secondary">展示示例</Typography><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{referenceDisplayText(sample, { ...config, referenceDisplayFields: selected })}</Typography></Box>
    <TextField select size="small" fullWidth label="搜索字段" value={searchFields} SelectProps={{ multiple: true }} onChange={event => {
      const next = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
      if (next.length) onChange({ referenceSearchFields: next });
    }}>{fields.map(item => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}</TextField>
    {supportsReferenceContext({ ...config, sourceType: source }) && <Stack direction="row" alignItems="center">
      <FormControlLabel sx={{ flex: 1, mr: 0 }} control={<Checkbox size="small" checked={config.referenceContextAutofill === true} onChange={(_, checked) => onChange({ referenceContextAutofill: checked })} />} label={<Typography variant="body2">自动带入当前生产上下文</Typography>} />
      <Tooltip title="仅在新建填报或新增记录行时填写空值；重开、刷新不覆盖已有内容。工序须是表单真实所属工序，批次共享表单不自动带入工序。"><IconButton size="small" aria-label="生产上下文带入说明"><InfoOutlined fontSize="small" /></IconButton></Tooltip>
    </Stack>}
  </Stack>;
}
