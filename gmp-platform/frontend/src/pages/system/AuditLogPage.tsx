import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, MenuItem, Pagination, CircularProgress,
} from '@mui/material';
import { getAuditLogs } from '@/api/audit';
import { AUDIT_ACTION_MAP } from '@/utils/constants';
import StatusBadge from '@/components/StatusBadge';
import type { PageResult } from '@/types/common';

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  operatorName: string;
  detail: string;
  createdAt: string;
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [operatorName, setOperatorName] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', page, action, entityType, operatorName],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, size: 10 };
      if (action) params.action = action;
      if (entityType) params.entityType = entityType;
      if (operatorName) params.operatorName = operatorName;
      const res = await getAuditLogs(params);
      return res.data.data as PageResult<AuditLog>;
    },
  });

  const content = data?.content ?? [];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">审计日志</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField select size="small" label="操作类型" value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          sx={{ minWidth: 150 }}>
          <MenuItem value="">全部</MenuItem>
          {Object.entries(AUDIT_ACTION_MAP).map(([key, val]) => (
            <MenuItem key={key} value={key}>{val.label}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" label="实体类型" value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          sx={{ minWidth: 150 }} />
        <TextField size="small" label="操作人" value={operatorName}
          onChange={(e) => { setOperatorName(e.target.value); setPage(1); }}
          sx={{ minWidth: 150 }} />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>操作类型</TableCell>
              <TableCell>实体类型</TableCell>
              <TableCell>实体ID</TableCell>
              <TableCell>操作人</TableCell>
              <TableCell>详情</TableCell>
              <TableCell>时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={7} align="center">加载失败</TableCell></TableRow>
            ) : content.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">暂无数据</TableCell></TableRow>
            ) : (
              content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={AUDIT_ACTION_MAP[item.action as keyof typeof AUDIT_ACTION_MAP]?.label || item.action}
                      color={AUDIT_ACTION_MAP[item.action as keyof typeof AUDIT_ACTION_MAP]?.color || 'default'}
                    />
                  </TableCell>
                  <TableCell>{item.entityType}</TableCell>
                  <TableCell>{item.entityId}</TableCell>
                  <TableCell>{item.operatorName}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.detail}</TableCell>
                  <TableCell>{item.createdAt}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {data && data.totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={data.totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}
    </Box>
  );
}
