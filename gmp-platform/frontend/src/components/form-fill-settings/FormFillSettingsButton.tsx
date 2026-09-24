import { useState } from 'react';
import { Button, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Stack, Typography } from '@mui/material';
import { TuneOutlined, AccountTreeOutlined, EditNoteOutlined } from '@mui/icons-material';
import AppDialog from '@/components/AppDialog';
import FormFillSettings, { type FillForm } from './FormFillSettings';
import { fillMode, type FormFillSettingsValue } from './types';

export function FormFillModeLabel({ value }: { value?: FormFillSettingsValue }) {
  const process = fillMode(value ?? {}) === 'PROCESS';
  return <Tooltip title={process ? value?.formProcessName || '按流程填报' : '直接填报'} arrow>
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0, color: 'primary.main' }}>
      {process ? <AccountTreeOutlined sx={{ fontSize: 14 }} /> : <EditNoteOutlined sx={{ fontSize: 14 }} />}
      <Typography variant="caption" noWrap>{process ? '流程填报' : '直接填报'}</Typography>
    </Stack>
  </Tooltip>;
}

export default function FormFillSettingsButton({ value, form, onChange }: {
  value?: FormFillSettingsValue;
  form: FillForm;
  onChange: (next: FormFillSettingsValue) => void;
}) {
  const [draft, setDraft] = useState<FormFillSettingsValue | null>(null);
  return <>
    <Tooltip title="填报设置" arrow><IconButton size="small" aria-label={`填报设置 ${form.name}`} onClick={() => setDraft(structuredClone(value ?? { fillMode: 'DIRECT' }))}><TuneOutlined sx={{ fontSize: 17 }} /></IconButton></Tooltip>
    <AppDialog open={Boolean(draft)} onClose={() => setDraft(null)} fullWidth maxWidth="sm">
      <DialogTitle>填报设置 · {form.name}</DialogTitle>
      <DialogContent dividers>{draft ? <FormFillSettings value={draft} form={form} editable onChange={setDraft} /> : null}</DialogContent>
      <DialogActions><Button onClick={() => setDraft(null)}>取消</Button><Button variant="contained"
        disabled={!draft || (fillMode(draft) === 'PROCESS' && !draft.formProcessVersionId)}
        onClick={() => { if (draft) onChange({ ...draft, fillMode: fillMode(draft) }); setDraft(null); }}>应用</Button></DialogActions>
    </AppDialog>
  </>;
}
