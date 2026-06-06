import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress,
} from '@mui/material';
import { getPermissions } from '@/api/identity';

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export default function PermissionPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await getPermissions({ size: 1000 });
      const body = res.data.data as { content: Permission[] } | Permission[];
      return Array.isArray(body) ? body : body.content ?? [];
    },
  });

  const permissions = data ?? [];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">权限配置</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>编码</TableCell>
              <TableCell>名称</TableCell>
              <TableCell>资源</TableCell>
              <TableCell>操作</TableCell>
              <TableCell>描述</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={6} align="center">加载失败</TableCell></TableRow>
            ) : permissions.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">暂无数据</TableCell></TableRow>
            ) : (
              permissions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.resource}</TableCell>
                  <TableCell>{item.action}</TableCell>
                  <TableCell>{item.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
