import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import type { EdhrAuditEntry, EdhrRecordStatusHistory } from '../types';

interface AuditPanelProps {
  auditEntries: EdhrAuditEntry[];
  statusHistory: EdhrRecordStatusHistory[];
}

export default function AuditPanel({ auditEntries, statusHistory }: AuditPanelProps) {
  return (
    <Stack spacing={1}>
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">审计记录</Typography>
            <Chip size="small" label={auditEntries.length} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {auditEntries.length === 0 ? (
            <EmptyLine text="暂无审计记录" />
          ) : (
            <List dense disablePadding>
              {auditEntries.map((entry) => (
                <ListItem key={entry.id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={entry.actionLabel} color="primary" variant="outlined" />
                        <Typography variant="body2" fontWeight={600}>{entry.operatorName}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatDateTime(entry.operatedAt)}</Typography>
                      </Stack>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {entry.remark || '无备注'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded disableGutters>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">状态历史</Typography>
            <Chip size="small" label={statusHistory.length} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {statusHistory.length === 0 ? (
            <EmptyLine text="暂无状态流转" />
          ) : (
            <List dense disablePadding>
              {statusHistory.map((history) => (
                <ListItem key={history.id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={history.fromStatus || '开始'} variant="outlined" />
                        <Typography variant="caption" color="text.disabled">→</Typography>
                        <Chip size="small" label={history.toStatus} color="info" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">{history.operatorName}</Typography>
                      </Stack>
                    }
                    secondary={`${formatDateTime(history.changedAt)} · ${history.remark || history.actionCode}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
      {text}
    </Typography>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}
