import { useEffect, useRef, useState } from 'react';
import { Box, Button, ButtonBase, Drawer, IconButton, Popover, TextField, Tooltip, Typography } from '@mui/material';
import { AddRounded, CloseRounded, ContentCopyOutlined, EditOutlined } from '@mui/icons-material';
import type { ExecutionFormState } from '@/api/production-execution';

interface Props {
  open: boolean;
  container: () => HTMLElement | null;
  formName: string;
  instanceIds: string[];
  forms: Record<string, ExecutionFormState>;
  selectedId: string;
  busy: boolean;
  canAdd: boolean;
  canEditRemark: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  beforeAdd: (open: () => void) => void;
  onAdd: (remark: string) => Promise<boolean>;
  onEditRemark: (id: string, remark: string) => Promise<boolean>;
  onCopyResult: (success: boolean) => void;
}

const createdTime = (value?: string) => value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—';

export default function ExecutionCopyDrawer({ open, container, formName, instanceIds, forms, selectedId, busy, canAdd, canEditRemark, onClose, onSelect, beforeAdd, onAdd, onEditRemark, onCopyResult }: Props) {
  const [adding, setAdding] = useState(false);
  const [remark, setRemark] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [addedSequence, setAddedSequence] = useState<number | null>(null);
  const [editing, setEditing] = useState<{ id: string; sequence: number; anchor: HTMLElement } | null>(null);
  const [editRemark, setEditRemark] = useState('');
  const [editAttempted, setEditAttempted] = useState(false);
  const submitting = useRef(false);
  const selectedCard = useRef<HTMLLIElement>(null);
  useEffect(() => { if (!open) { setAdding(false); setRemark(''); setAttempted(false); setAddedSequence(null); setEditing(null); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => selectedCard.current?.scrollIntoView({ block: 'nearest' }));
    return () => cancelAnimationFrame(frame);
  }, [open, selectedId]);
  const add = async () => {
    setAttempted(true);
    if (!remark.trim() || remark.trim().length > 500 || busy || submitting.current || !canAdd) return;
    submitting.current = true;
    try {
      if (await onAdd(remark.trim())) { setAddedSequence(instanceIds.length + 1); setAdding(false); setRemark(''); setAttempted(false); }
    } finally { submitting.current = false; }
  };
  const saveRemark = async () => {
    setEditAttempted(true);
    if (!editing || !editRemark.trim() || editRemark.trim().length > 500 || busy || submitting.current || !canEditRemark) return;
    submitting.current = true;
    try { if (await onEditRemark(editing.id, editRemark.trim())) setEditing(null); }
    finally { submitting.current = false; }
  };
  return <Drawer anchor="left" open={open} onClose={() => { if (!busy) onClose(); }} container={container}
    className="execution-operation-drawer execution-copy-drawer"
    PaperProps={{ role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'execution-copy-drawer-title', id: 'execution-copy-drawer' }}>
    <Box className="execution-drawer-heading">
      <Typography component="h2" id="execution-copy-drawer-title">切换份序</Typography>
      <IconButton size="small" aria-label="关闭份序抽屉" disabled={busy} onClick={onClose}><CloseRounded fontSize="small" /></IconButton>
    </Box>
    <Box className="execution-copy-drawer-summary">
      <Box className="execution-copy-toolbar">
        <Box className="execution-copy-form-heading"><Tooltip title={formName}><Typography component="h3">{formName}</Typography></Tooltip>
          <Typography className="execution-copy-count">共 {instanceIds.length} 份</Typography></Box>
        {!adding && <Button variant="contained" size="small" disableElevation startIcon={<AddRounded />} disabled={busy || !canAdd}
          onClick={() => beforeAdd(() => { setRemark(''); setAttempted(false); setAdding(true); })}>新增一份</Button>}
      </Box>
      {adding && <Box component="form" className="execution-copy-create" onSubmit={event => { event.preventDefault(); void add(); }}>
        <Typography component="h4">新增第 {instanceIds.length + 1} 份</Typography>
        <TextField autoFocus fullWidth required multiline minRows={2} maxRows={5} size="small" label="本份备注"
          placeholder="填写本份表单的用途或说明" value={remark} disabled={busy}
          inputProps={{ maxLength: 500 }} onChange={event => setRemark(event.target.value)}
          error={attempted && !remark.trim()} helperText={attempted && !remark.trim() ? '请填写本份备注' : `${remark.length}/500`} />
        <Box className="execution-copy-create-actions"><Button disabled={busy} onClick={() => { setAdding(false); setRemark(''); }}>取消</Button>
          <Button type="submit" variant="contained" disableElevation disabled={busy || !canAdd}>{busy ? '正在创建…' : '确认新增'}</Button></Box>
      </Box>}
    </Box>
    <Box component="ul" className="execution-copy-drawer-list" aria-label="当前表单份序">
      {instanceIds.map((id, index) => {
        const copy = forms[id];
        const status = copy?.status ?? 'PENDING';
        const selected = id === selectedId;
        return <Box component="li" key={id} ref={selected ? selectedCard : undefined} className={`execution-copy-card${selected ? ' is-selected' : ''}${index + 1 === addedSequence ? ' is-new' : ''}`}>
          <ButtonBase className="execution-copy-card-select" disableRipple disabled={busy || adding || Boolean(editing)} aria-current={selected ? 'true' : undefined}
            aria-label={`选择第 ${index + 1} 份${selected ? '，当前选中' : ''}`} onClick={() => onSelect(id)} />
            <Box className="execution-copy-content">
              <Box className="execution-copy-drawer-row">
                <Typography component="strong" className="execution-copy-title" title={selected ? '当前选中' : undefined}>第 {index + 1} 份</Typography>
                <Box className="execution-copy-remark-group">
                  <Tooltip title={copy?.remark || '暂无备注'}><Typography component="span" className={`execution-copy-remark${copy?.remark ? '' : ' is-empty'}`}
                    onClick={() => { if (!busy && !adding && !editing) onSelect(id); }}>{copy?.remark || '暂无备注'}</Typography></Tooltip>
                  {canEditRemark && <Tooltip title="修改备注"><IconButton className="execution-copy-remark-edit" size="small" aria-label={`修改第 ${index + 1} 份备注`}
                    disabled={busy || adding} onClick={event => { setEditRemark(copy?.remark ?? ''); setEditAttempted(false); setEditing({ id, sequence: index + 1, anchor: event.currentTarget }); }}><EditOutlined /></IconButton></Tooltip>}
                </Box>
                <Typography component="span" className="execution-form-status" data-status={status}>{status === 'COMPLETED' ? '已完成' : status === 'PENDING' ? '未填报' : '进行中'}</Typography>
              </Box>
              <Typography component="span" className="execution-copy-number" title={`表单实例号：${copy?.instanceNo || '未生成'}`}>{copy?.instanceNo || '实例号未生成'}</Typography>
              <Box className="execution-copy-creation"><Typography component="span" title={`创建人：${copy?.createdByName || '—'}`}>{copy?.createdByName || '创建人 —'}</Typography>
                <Typography component="time" title={`创建时间：${createdTime(copy?.createdAt)}`} dateTime={copy?.createdAt}>{copy?.createdAt ? createdTime(copy.createdAt) : '创建时间 —'}</Typography></Box>
            </Box>
            <Tooltip title={copy?.instanceNo ? '复制表单实例号' : '实例号尚未生成'}><span className="execution-copy-number-action"><IconButton size="small" disabled={!copy?.instanceNo}
              aria-label={`复制第 ${index + 1} 份表单实例号`} onClick={async () => {
                try { await navigator.clipboard.writeText(copy!.instanceNo!); onCopyResult(true); } catch { onCopyResult(false); }
              }}><ContentCopyOutlined /></IconButton></span></Tooltip>
        </Box>;
      })}
    </Box>
    <Popover open={Boolean(editing)} anchorEl={editing?.anchor} container={container} onClose={() => { if (!busy) setEditing(null); }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{ sx: { width: 300, maxWidth: 'calc(100vw - 32px)', p: 2 }, role: 'dialog', 'aria-label': `修改第 ${editing?.sequence ?? ''} 份备注` }}>
      {editing && <Box component="form" onSubmit={event => { event.preventDefault(); void saveRemark(); }}>
        <TextField autoFocus fullWidth required multiline minRows={2} maxRows={5} size="small" label={`第 ${editing.sequence} 份备注`}
          value={editRemark} disabled={busy} inputProps={{ maxLength: 500 }} onChange={event => setEditRemark(event.target.value)}
          error={editAttempted && !editRemark.trim()} helperText={editAttempted && !editRemark.trim() ? '请填写本份备注' : `${editRemark.length}/500`} />
        <Box className="execution-copy-create-actions"><Button disabled={busy} onClick={() => setEditing(null)}>取消</Button>
          <Button type="submit" variant="contained" disableElevation disabled={busy || !canEditRemark}>{busy ? '保存中…' : '保存备注'}</Button></Box>
      </Box>}
    </Popover>
  </Drawer>;
}
