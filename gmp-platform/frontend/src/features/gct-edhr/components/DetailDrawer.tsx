import {
  Box,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Close, Edit } from '@mui/icons-material';
import type { EdhrActionMeta, EdhrAuditEntry, EdhrFieldMeta, EdhrPageMeta, EdhrRecord, EdhrRecordStatusHistory } from '../types';
import AuditPanel from './AuditPanel';
import PermissionButton from './PermissionButton';

interface DetailDrawerProps {
  page: EdhrPageMeta;
  selectedRecord: EdhrRecord | null;
  auditEntries: EdhrAuditEntry[];
  statusHistory: EdhrRecordStatusHistory[];
  actions: EdhrActionMeta[];
  open: boolean;
  onClose: () => void;
  onEdit: (record: EdhrRecord) => void;
  onAction: (action: EdhrActionMeta, record: EdhrRecord) => void;
}

const hiddenActionCodes = new Set(['query', 'reset', 'create', 'add', 'import', 'export', 'download', 'batch_download']);

export default function DetailDrawer({
  page,
  selectedRecord,
  auditEntries,
  statusHistory,
  actions,
  open,
  onClose,
  onEdit,
  onAction,
}: DetailDrawerProps) {
  const record = selectedRecord;
  const businessFields = page.fields.filter((field) => !field.system).slice(0, 18);
  const detailActions = actions.filter((action) => !hiddenActionCodes.has(action.code)).slice(0, 8);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 620 }, p: 2, bgcolor: '#f7f9fc', minHeight: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{page.title}详情</Typography>
            {record ? (
              <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={record.status} color="primary" variant="outlined" />
                <Chip size="small" label={record.id} />
              </Stack>
            ) : null}
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="关闭详情">
            <Close />
          </IconButton>
        </Stack>

        {!record ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            请选择一条记录查看详情。
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <PermissionButton
                action={{ code: 'edit', label: '编辑', permissionRequired: false, auditRequired: true }}
                onClick={() => onEdit(record)}
              />
              {detailActions.map((action) => (
                <PermissionButton
                  key={action.id}
                  action={action}
                  compact
                  onClick={() => onAction(action, record)}
                />
              ))}
            </Stack>

            <Section title="业务字段">
              <Grid container spacing={1}>
                {businessFields.map((field) => (
                  <Grid item xs={12} sm={6} key={field.id}>
                    <FieldLine field={field} value={getRecordValue(record, field)} />
                  </Grid>
                ))}
              </Grid>
            </Section>

            <Section title="系统字段">
              <Grid container spacing={1}>
                {page.systemFields.map((field) => (
                  <Grid item xs={12} sm={6} key={field.id}>
                    <FieldLine field={field} value={getRecordValue(record, field)} />
                  </Grid>
                ))}
              </Grid>
            </Section>

            <Section title="审计与状态">
              <AuditPanel auditEntries={auditEntries} statusHistory={statusHistory} />
            </Section>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ p: 1.5, bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
      <Divider sx={{ mb: 1 }} />
      {children}
    </Box>
  );
}

function FieldLine({ field, value }: { field: EdhrFieldMeta; value: unknown }) {
  return (
    <Box sx={{ minHeight: 54 }}>
      <Typography variant="caption" color="text.secondary">{field.label}</Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{formatValue(value)}</Typography>
    </Box>
  );
}

function getRecordValue(record: EdhrRecord, field: EdhrFieldMeta): unknown {
  if (field.name in record) return record[field.name as keyof EdhrRecord];
  return record.values[field.name] ?? record.values[field.label];
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'number') return value.toLocaleString('zh-CN');
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
  }
  return String(value);
}
