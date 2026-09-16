import { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Autocomplete, Box, Button, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { AddRounded, DeleteOutlineRounded, UploadFileRounded } from '@mui/icons-material';
import type { CanvasNode, ModelField } from '@/pages/master-data/template-designer-react/types';
import CellDisplayContent from '@/pages/master-data/template-designer-react/components/CellDisplayContent';
import { isCellDisplayNode } from '@/pages/master-data/template-designer-react/registry/commonComponentRegistry';
import { readNodeCellRange } from '@/pages/master-data/template-designer-react/utils/subTableRegion';
import SignatureDisplay from './SignatureDisplay';
import { readSignaturePresentation } from './signaturePresentation';

export interface FormRuntime {
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  disabled?: boolean;
  upload?: (file: File) => Promise<{ fileId: string; originalName: string }>;
  references?: (fieldId: string, keyword: string) => Promise<Array<{ id: string; name: string }>>;
}
export const FormRuntimeContext = createContext<FormRuntime | undefined>(undefined);
export const SignatureDisplayModeContext = createContext<Record<string, unknown>>({});
export const SubTableDisplayNodesContext = createContext<CanvasNode[]>([]);

export function FormRuntimeField({ field, readOnly = false, signatureDisplayMode }: { field: ModelField; readOnly?: boolean; signatureDisplayMode?: unknown }) {
  const runtime = useContext(FormRuntimeContext);
  const signatureDisplayModes = useContext(SignatureDisplayModeContext);
  if (!runtime) return null;
  const value = runtime.values[field.id] ?? '';
  const config = field.typeConfig ?? {};
  const disabled = readOnly || runtime.disabled || field.type === 'signature';
  const props = { fullWidth: true, size: 'small' as const, disabled, inputProps: { 'aria-label': field.name, 'data-field-id': field.id },
    sx: { bgcolor: 'white', '& .MuiInputBase-root': { fontSize: 13 } } };
  if (field.type === 'singleSelect' || field.type === 'multiSelect') {
    const raw = config.options;
    const options: Array<{ value: string; label: string }> = Array.isArray(raw)
      ? raw.filter((item) => item.status !== 'disabled').map((item) => ({ value: String(item.value), label: String(item.label) }))
      : String(raw ?? '').split('\n').filter(Boolean).map((item) => { const [label, key] = item.split(':'); return { label, value: key ?? label }; });
    return <TextField {...props} select value={field.type === 'multiSelect' ? (Array.isArray(value) ? value : []) : String(value)}
      SelectProps={{ multiple: field.type === 'multiSelect' }} onChange={(event) => runtime.onChange(field.id, event.target.value)}>
      {field.type !== 'multiSelect' && <MenuItem value="">请选择</MenuItem>}
      {options.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
    </TextField>;
  }
  if (field.type === 'signature') return readSignaturePresentation(value)
    ? <SignatureDisplay value={value} displayMode={signatureDisplayMode ?? signatureDisplayModes[field.id] ?? config.signatureDisplayMode} />
    : <Typography variant="body2" color="text.secondary">执行签署动作后自动记录</Typography>;
  if (field.type === 'subTable') return <RuntimeSubTable field={field} disabled={Boolean(disabled)} runtime={runtime} />;
  if (field.type === 'reference') return <RuntimeReference field={field} disabled={Boolean(disabled)} runtime={runtime} />;
  if (field.type === 'attachment' || field.type === 'image') return <RuntimeFiles field={field} disabled={Boolean(disabled)} runtime={runtime} />;
  const type = field.type === 'number' ? 'number' : field.type === 'datetime' ? (config.mode === 'date' ? 'date' : config.mode === 'time' ? 'time' : 'datetime-local') : 'text';
  return <TextField {...props} type={type} value={String(value)} onChange={(event) => runtime.onChange(field.id, event.target.value)}
    multiline={field.type === 'text' && config.textMode === 'long'} minRows={field.type === 'text' && config.textMode === 'long' ? 3 : undefined} />;
}

function RuntimeSubTable({ field, disabled, runtime }: { field: ModelField; disabled: boolean; runtime: FormRuntime }) {
  const templateNodes = useContext(SubTableDisplayNodesContext).filter((node) => node.bindings?.subTableId === field.id);
  const raw = field.typeConfig.columns;
  const columns = (Array.isArray(raw) ? raw : String(raw ?? '').split(/[\n,，]/).filter(Boolean)).map((item, index) =>
    typeof item === 'string' ? { id: `sub-field-${index + 1}`, name: item, type: 'text', typeConfig: {}, status: 'enabled' } as ModelField : item as ModelField).filter((item) => item.status !== 'disabled');
  const rows = Array.isArray(runtime.values[field.id]) ? runtime.values[field.id] as Record<string, unknown>[] : [];
  const displayNodes = templateNodes.filter(isCellDisplayNode);
  const positionOf = (node?: CanvasNode) => node ? readNodeCellRange(node)?.l ?? Infinity : Infinity;
  const entries = [
    ...columns.map((column) => ({ id: column.id, label: column.name, column, node: undefined as CanvasNode | undefined, position: positionOf(templateNodes.find((node) => node.bindings?.subTableFieldId === column.id)) })),
    ...displayNodes.map((node) => ({ id: node.id, label: node.props.commonComponentId === 'serial-number' ? '序号' : String(node.props.text ?? node.props.alt ?? ''), column: undefined as ModelField | undefined, node, position: readNodeCellRange(node)?.l ?? Infinity })),
  ];
  if (displayNodes.length) entries.sort((a, b) => a.position - b.position);
  if (!entries.length) return <Alert severity="warning">子表尚未配置字段，无法填报。</Alert>;
  return <Box sx={{ width: '100%', overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>{entries.map((entry) => <TableCell key={entry.id}>{entry.label}</TableCell>)}<TableCell /></TableRow></TableHead><TableBody>
    {rows.map((row, index) => <TableRow key={index}>{entries.map(({ id, node, column }) => <TableCell key={id} sx={{ minWidth: node ? 40 : 140 }}>{node ? <Box sx={{ height: 32 }}><CellDisplayContent node={node} recordIndex={index} /></Box> : column ? <FormRuntimeContext.Provider value={{ ...runtime, values: row, disabled, onChange: (id, value) => runtime.onChange(field.id, rows.map((item, i) => i === index ? { ...item, [id]: value } : item)) }}><FormRuntimeField field={column} readOnly={disabled} /></FormRuntimeContext.Provider> : null}</TableCell>)}
      <TableCell><IconButton size="small" aria-label={`删除第 ${index + 1} 行`} disabled={disabled} onClick={() => runtime.onChange(field.id, rows.filter((_, i) => i !== index))}><DeleteOutlineRounded /></IconButton></TableCell></TableRow>)}
  </TableBody></Table><Button startIcon={<AddRounded />} size="small" disabled={disabled} onClick={() => runtime.onChange(field.id, [...rows, {}])}>添加记录</Button></Box>;
}

function RuntimeFiles({ field, disabled, runtime }: { field: ModelField; disabled: boolean; runtime: FormRuntime }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const files = Array.isArray(runtime.values[field.id]) ? runtime.values[field.id] as Array<{ fileId: string; originalName: string }> : [];
  return <Stack spacing={1} sx={{ width: '100%' }}>{files.map((file, index) => <Stack key={file.fileId} direction="row" alignItems="center"><Typography variant="body2" sx={{ flex: 1 }}>{file.originalName}</Typography><IconButton aria-label={`移除 ${file.originalName}`} size="small" disabled={disabled || busy} onClick={() => runtime.onChange(field.id, files.filter((_, i) => i !== index))}><DeleteOutlineRounded fontSize="small" /></IconButton></Stack>)}
    {error && <Alert severity="error">{error}</Alert>}
    <Button component="label" startIcon={<UploadFileRounded />} disabled={disabled || busy || !runtime.upload} size="small">{busy ? '正在上传…' : field.type === 'image' ? '上传图片' : '上传附件'}<input hidden type="file" accept={field.type === 'image' ? 'image/*' : String(field.typeConfig.allowedFileTypes ?? '')} onChange={async (event) => {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file || !runtime.upload) return;
      setBusy(true); setError('');
      try { const saved = await runtime.upload(file); runtime.onChange(field.id, [...files, saved]); }
      catch { setError('文件上传失败，请重试。'); } finally { setBusy(false); }
    }} /></Button></Stack>;
}

function RuntimeReference({ field, disabled, runtime }: { field: ModelField; disabled: boolean; runtime: FormRuntime }) {
  const [options, setOptions] = useState<Array<{ id: string; name: string }>>([]); const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (disabled || !runtime.references) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      runtime.references!(field.id, keyword).then((items) => { if (active) { setOptions(items); setError(''); } }).catch(() => { if (active) setError('引用数据加载失败，请检查配置或权限。'); }).finally(() => { if (active) setLoading(false); });
    }, 200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [field.id, disabled, runtime.references, keyword]);
  const value = runtime.values[field.id] as { id: string; name: string } | undefined;
  return <Autocomplete fullWidth size="small" disabled={disabled} options={options} value={value?.id ? value : null} loading={loading}
    getOptionLabel={(item) => item.name} isOptionEqualToValue={(item, selected) => item.id === selected.id} filterOptions={(items) => items}
    noOptionsText="未找到匹配记录" loadingText="正在查询…" onInputChange={(_, text, reason) => { if (reason === 'input' || reason === 'clear') setKeyword(text); }}
    onChange={(_, selected) => runtime.onChange(field.id, selected)}
    renderOption={(props, item) => <li {...props} key={item.id}>{item.name} · {item.id}</li>}
    renderInput={(params) => <TextField {...params} label={field.name} error={Boolean(error)} helperText={error || (!disabled ? '输入名称或记录编号搜索' : undefined)} />} />;
}
