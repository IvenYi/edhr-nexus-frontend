import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import type { EdhrActionMeta, EdhrFieldMeta, EdhrPageMeta, EdhrRecord, EdhrRecordMutationInput, EdhrActionExecuteInput } from '../types';
import { getActionLabel } from '../utils/actionPolicy';
import { getSelectOptions, inferEdhrFieldType } from '../utils/fieldInfer';

export type EdhrFormMode = 'create' | 'edit' | 'copy' | 'version' | 'action';

interface FormDialogProps {
  page: EdhrPageMeta;
  open: boolean;
  mode: EdhrFormMode;
  record?: EdhrRecord | null;
  action?: EdhrActionMeta | null;
  createRecord: (input?: EdhrRecordMutationInput) => Promise<EdhrRecord>;
  updateRecord: (recordId: string, input: EdhrRecordMutationInput) => Promise<EdhrRecord>;
  executeAction: (recordId: string, actionCode: string, input?: EdhrActionExecuteInput) => Promise<unknown>;
  onClose: () => void;
  onSaved?: (message: string) => void;
}

export default function FormDialog({
  page,
  open,
  mode,
  record,
  action,
  createRecord,
  updateRecord,
  executeAction,
  onClose,
  onSaved,
}: FormDialogProps) {
  const fields = useMemo(() => page.formFields.filter((field) => !field.system).slice(0, 16), [page.formFields]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initialValues = fields.reduce<Record<string, unknown>>((acc, field) => {
      acc[field.name] = record?.values[field.name] ?? '';
      return acc;
    }, {});
    setValues(initialValues);
    setRemark(mode === 'copy' ? '复制记录' : mode === 'version' ? '创建版本' : '');
  }, [fields, mode, open, record]);

  const title = getDialogTitle(mode, action);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === 'create') {
        await createRecord({ values, remark, operatorName: '前端演示用户' });
      } else if (mode === 'edit' && record) {
        await updateRecord(record.id, { values, remark, operatorName: '前端演示用户' });
      } else if (record) {
        const actionCode = mode === 'copy' ? 'copy' : mode === 'version' ? action?.code ?? 'version_create' : action?.code ?? 'save';
        await executeAction(record.id, actionCode, { values, remark, operatorName: '前端演示用户' });
      }
      onSaved?.(`${title}已保存`);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={1.5}>
          {fields.map((field) => (
            <Grid item xs={12} sm={getFieldGrid(field)} key={field.id}>
              <FormField
                field={field}
                page={page}
                value={values[field.name] ?? ''}
                onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="备注"
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>取消</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface FormFieldProps {
  field: EdhrFieldMeta;
  page: EdhrPageMeta;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FormField({ field, page, value, onChange }: FormFieldProps) {
  const fieldType = inferEdhrFieldType(field);

  if (fieldType === 'status' || fieldType === 'select') {
    const options = fieldType === 'status'
      ? Array.from(new Set([...page.baseStatuses, ...page.businessStatuses, '草稿', '启用', '禁用']))
      : getSelectOptions(field.label);
    return (
      <TextField
        select
        fullWidth
        required={field.required}
        size="small"
        label={field.label}
        value={String(value ?? '')}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">请选择</MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return (
    <TextField
      fullWidth
      required={field.required}
      size="small"
      label={field.label}
      type={fieldType === 'date' ? 'date' : fieldType === 'datetime' ? 'datetime-local' : fieldType === 'number' ? 'number' : 'text'}
      multiline={fieldType === 'textarea'}
      minRows={fieldType === 'textarea' ? 3 : undefined}
      value={formatInputValue(value, fieldType)}
      onChange={(event) => onChange(fieldType === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value)}
      InputLabelProps={fieldType === 'date' || fieldType === 'datetime' ? { shrink: true } : undefined}
    />
  );
}

function getDialogTitle(mode: EdhrFormMode, action?: EdhrActionMeta | null): string {
  if (mode === 'create') return '新建记录';
  if (mode === 'edit') return '编辑记录';
  if (mode === 'copy') return '复制记录';
  if (mode === 'version') return '创建版本';
  return action ? `${getActionLabel(action.code, action)}输入` : '动作输入';
}

function getFieldGrid(field: EdhrFieldMeta): 6 | 12 {
  const fieldType = inferEdhrFieldType(field);
  return fieldType === 'textarea' ? 12 : 6;
}

function formatInputValue(value: unknown, fieldType: ReturnType<typeof inferEdhrFieldType>): string | number {
  if (value === undefined || value === null) return '';
  if (fieldType === 'datetime' && typeof value === 'string') return value.slice(0, 16);
  return value as string | number;
}
