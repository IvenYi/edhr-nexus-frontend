import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Autocomplete, Button, Stack, TextField, Typography } from '@mui/material';
import { getReferenceDictionaries } from '@/api/form-references';

export default function ReferenceDictionaryConfig({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const options = useQuery({ queryKey: ['reference-dictionaries', keyword], queryFn: () => getReferenceDictionaries({ keyword }), enabled: open });
  const selected = useQuery({ queryKey: ['reference-dictionary', value], queryFn: () => getReferenceDictionaries({ id: value }), enabled: Boolean(value) });
  const current = selected.data?.[0] ?? options.data?.find(item => item.id === value) ?? null;
  return <Stack spacing={0.5}>
    <Autocomplete size="small" fullWidth open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}
      options={options.data ?? []} value={current} loading={options.isFetching || selected.isFetching} filterOptions={items => items}
      getOptionLabel={item => `${item.name} [${item.code}]`} isOptionEqualToValue={(item, chosen) => item.id === chosen.id}
      onInputChange={(_, text, reason) => { if (reason === 'input' || reason === 'clear') setKeyword(text); }}
      onChange={(_, item) => onChange(item?.id ?? '')}
      noOptionsText={options.isError ? <Button size="small" onClick={() => options.refetch()}>加载失败，点击重试</Button> : '未找到字典，请输入名称或编码搜索'}
      renderInput={params => <TextField {...params} label="业务字典" required placeholder="搜索并选择具体字典" error={Boolean(value) && (selected.isError || !selected.isPending && !current)} />} />
    <Typography variant="caption" color="text.secondary">填报时只显示此字典下已启用的选项。</Typography>
    {value && selected.isError && <Button size="small" onClick={() => selected.refetch()}>字典读取失败，重试</Button>}
    {current?.status !== undefined && current.status !== 'ACTIVE' && <Typography variant="caption" color="warning.main">该字典已停用，请重新选择。</Typography>}
  </Stack>;
}
