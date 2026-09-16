import { useRef, useState, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import AppDialog from '@/components/AppDialog';
import { downloadOperationImportTemplate, importOperations, type OperationImportResult } from '@/api/master-data';

interface Props {
  notify: (message: string, severity: 'success' | 'error') => void;
}

async function errorMessage(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: { message?: string } | Blob } })?.response?.data;
  if (data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text()) as { message?: string };
      return body.message || fallback;
    } catch { return fallback; }
  }
  return data?.message || fallback;
}

export default function OperationImportActions({ notify }: Props) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<OperationImportResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const mutation = useMutation({
    mutationFn: importOperations,
    onSuccess: async (response) => {
      const imported = response.data.data;
      setResult(imported);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['process-modeling-operations'] }),
        queryClient.invalidateQueries({ queryKey: ['process-modeling-operation-categories'] }),
        queryClient.invalidateQueries({ queryKey: ['process-modeling-operation-audit'] }),
      ]);
      notify(`导入完成：成功 ${imported.successCount} 条，跳过 ${imported.skippedCount} 条，失败 ${imported.failedCount} 条`, 'success');
    },
    onError: async (error) => notify(await errorMessage(error, '工序导入失败'), 'error'),
  });

  const download = async () => {
    setDownloading(true);
    try {
      const response = await downloadOperationImportTemplate();
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = '工序导入模板.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      notify(await errorMessage(error, '下载工序导入模板失败'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      notify('仅支持上传 .xlsx 文件', 'error');
      return;
    }
    mutation.mutate(file);
  };

  const rows = result ? [
    ...result.skippedRows.map((row) => ({ ...row, outcome: '跳过' })),
    ...result.failedRows.map((row) => ({ ...row, outcome: '失败' })),
  ].sort((left, right) => left.rowNumber - right.rowNumber) : [];

  return (
    <>
      <Button size="small" variant="outlined" onClick={() => void download()} disabled={downloading}>
        {downloading ? '下载中...' : '下载模板'}
      </Button>
      <Button size="small" variant="outlined" onClick={() => fileInput.current?.click()} disabled={mutation.isPending}>
        {mutation.isPending ? '导入中...' : '导入数据'}
      </Button>
      <input ref={fileInput} type="file" accept=".xlsx" aria-label="工序导入文件" hidden onChange={selectFile} />
      <AppDialog open={result !== null} onClose={() => setResult(null)} maxWidth="md" fullWidth>
        <DialogTitle>工序导入结果</DialogTitle>
        <DialogContent dividers>
          {result ? (
            <Stack spacing={1.5}>
              <Typography variant="body2">
                成功导入 {result.successCount} 条，跳过 {result.skippedCount} 条，失败 {result.failedCount} 条。
              </Typography>
              {rows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {result.successCount > 0 ? '所有数据均已成功导入。' : '文件中没有可导入的数据。'}
                </Typography>
              ) : (
                <TableContainer sx={{ border: '1px solid #e4e7ed', borderRadius: 1 }}>
                  <Table size="small" sx={{ tableLayout: 'fixed' }}>
                    <TableHead><TableRow>
                      {['行号', '工序编码', '工序名称', '结果', '原因'].map((label) => (
                        <TableCell key={label} sx={{ bgcolor: '#f5f7fa', fontWeight: 600 }}>{label}</TableCell>
                      ))}
                    </TableRow></TableHead>
                    <TableBody>{rows.map((row) => (
                      <TableRow key={`${row.outcome}-${row.rowNumber}`}>
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell sx={{ overflowWrap: 'anywhere' }}>{row.code || '-'}</TableCell>
                        <TableCell sx={{ overflowWrap: 'anywhere' }}>{row.name || '-'}</TableCell>
                        <TableCell>{row.outcome}</TableCell>
                        <TableCell sx={{ overflowWrap: 'anywhere' }}>{row.reason}</TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions><Button onClick={() => setResult(null)}>关闭</Button></DialogActions>
      </AppDialog>
    </>
  );
}
