import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AccountTreeOutlined, RestartAlt, Search } from '@mui/icons-material';
import StatusBadge from '@/components/StatusBadge';
import { getRdoVersionStatusMeta } from '@/utils/rdoVersionStatus';
import { getProductModelingProducts } from '@/api/product-modeling';

const PAGE_SIZE = 20;

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.replace('T', ' ').slice(0, 16) : date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

export default function ProductModelingPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('ALL');
  const [submittedFilters, setSubmittedFilters] = useState({ keyword: '', status: 'ALL' });

  const query = useQuery({
    queryKey: ['product-modeling-products', page, submittedFilters],
    queryFn: async () => (await getProductModelingProducts({ page, size: PAGE_SIZE, ...submittedFilters })).data.data,
  });
  const rows = query.data?.content ?? [];
  const totalPages = query.data?.totalPages ?? 0;
  const isTableEmptyState = query.isLoading || query.isError || rows.length === 0;

  const submit = () => {
    setPage(1);
    setSubmittedFilters({ keyword: keyword.trim(), status });
  };

  return (
    <Box sx={{ minWidth: 0, height: { xs: 'auto', lg: 'calc(100vh - 150px)' }, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0, overflow: 'hidden' }}>
      <Box sx={{ flex: '0 0 auto', border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'flex-end' }}>
          <Box sx={{ width: { xs: '100%', md: 340 } }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#606266' }}>名称/编码</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="请输入"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') submit(); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', md: 240 } }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#606266' }}>状态</Typography>
            <FormControl fullWidth size="small">
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <MenuItem value="ALL">全部</MenuItem>
                <MenuItem value="ACTIVE">生效</MenuItem>
                <MenuItem value="EXPIRED">失效</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Stack direction="row" spacing={1} sx={{ ml: { md: 'auto' } }}>
            <Button variant="outlined" startIcon={<RestartAlt />} onClick={() => { setKeyword(''); setStatus('ALL'); setPage(1); setSubmittedFilters({ keyword: '', status: 'ALL' }); }}>重置</Button>
            <Button variant="contained" startIcon={<Search />} onClick={submit}>查询</Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, border: '1px solid #e4e7ed', borderRadius: 1, bgcolor: '#fff', overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid #ebeef5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#606266' }}>由物料类型为半成品或产成品的物料自动派生</Typography>
          <Typography variant="caption" sx={{ color: '#909399', whiteSpace: 'nowrap' }}>制程配置按物料版本分别维护</Typography>
        </Box>
        <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Table stickyHeader size="small" sx={{ minWidth: 1180, tableLayout: 'fixed', height: isTableEmptyState ? '100%' : 'auto' }}>
            <TableHead>
              <TableRow>
                {['名称', '编码', '物料版本', '规格型号', '物料类型', '单位', '来源状态', '配置版本', '生效配置', '更新人', '更新时间', '操作'].map((label) => (
                  <TableCell key={label} sx={{ bgcolor: '#f5f7fa', color: '#606266', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={{ height: isTableEmptyState ? '100%' : 'auto' }}>
              {query.isLoading ? (
                <TableRow sx={{ height: '100%' }}><TableCell colSpan={12} align="center" sx={{ height: '100%', py: 0, color: '#909399' }}>加载中...</TableCell></TableRow>
              ) : query.isError ? (
                <TableRow sx={{ height: '100%' }}><TableCell colSpan={12} align="center" sx={{ height: '100%', py: 0, color: '#c62828' }}>加载失败</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow sx={{ height: '100%' }}><TableCell colSpan={12} align="center" sx={{ height: '100%', py: 0, color: '#909399' }}>暂无数据</TableCell></TableRow>
              ) : rows.map((row) => {
                const sourceStatus = getRdoVersionStatusMeta(row.status);
                return (
                  <TableRow hover key={row.id}>
                    <TableCell sx={{ fontWeight: 500, color: '#303133' }}>{row.name}</TableCell>
                    <TableCell>{row.code || '-'}</TableCell>
                    <TableCell>{row.version || '-'}</TableCell>
                    <TableCell>{row.specification || '-'}</TableCell>
                    <TableCell>{row.materialTypeName || '-'}</TableCell>
                    <TableCell>{row.unit || '-'}</TableCell>
                    <TableCell><StatusBadge label={sourceStatus.label} color={sourceStatus.color} /></TableCell>
                    <TableCell>{row.modelVersionCount}</TableCell>
                    <TableCell>{row.activeModelVersionCount}</TableCell>
                    <TableCell>{row.updatedBy || '-'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="产品建模">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/master-data/products/${row.id}/modeling`)}>
                          <AccountTreeOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ flex: '0 0 auto', minHeight: 56, px: 2, borderTop: '1px solid #ebeef5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: '#606266' }}>共 {query.data?.totalElements ?? 0} 条数据</Typography>
          {totalPages > 1 && <Pagination size="small" count={totalPages} page={page} onChange={(_, value) => setPage(value)} />}
        </Box>
      </Box>
    </Box>
  );
}
