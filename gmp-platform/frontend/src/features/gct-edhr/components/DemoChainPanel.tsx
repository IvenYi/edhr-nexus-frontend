import { useMemo } from 'react';
import { Box, ButtonBase, Chip, Paper, Stack, Typography } from '@mui/material';
import { ArrowForward, Route } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GCT_EDHR_PAGES } from '../metadata/generatedPages';
import type { EdhrPageMeta } from '../types';

interface DemoChainPanelProps {
  currentPage?: EdhrPageMeta;
}

export const GCT_EDHR_DEMO_CHAIN_STEPS = [
  { label: '基础建模', pageCode: 'gct_2_3_product_list' },
  { label: '工单', pageCode: 'gct_3_1_work_order_management' },
  { label: '批次/SN', pageCode: 'gct_3_2_batch_management' },
  { label: '生产执行', pageCode: 'gct_3_4_production_execution' },
  { label: '检验执行', pageCode: 'gct_4_1_inspection_execution' },
  { label: '放行', pageCode: 'gct_5_1_release_list' },
  { label: '表单/DHR', pageCode: 'gct_6_4_dhr_filling' },
  { label: '打印', pageCode: 'gct_6_16_my_printing' },
  { label: '追溯报表', pageCode: 'gct_7_1_production_traceability' },
] as const;

export default function DemoChainPanel({ currentPage }: DemoChainPanelProps) {
  const navigate = useNavigate();
  const steps = useMemo(() => {
    const pagesByCode = new Map(GCT_EDHR_PAGES.map((page) => [page.code, page]));
    return GCT_EDHR_DEMO_CHAIN_STEPS.map((step) => {
      const page = pagesByCode.get(step.pageCode);
      if (!page) {
        throw new Error(`GCT demo chain step "${step.label}" references missing pageCode "${step.pageCode}"`);
      }
      return { ...step, page };
    });
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: '#fff' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Route color="primary" fontSize="small" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>主链路导航</Typography>
        <Chip size="small" label="demo chain" variant="outlined" />
      </Stack>
      <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.25 }}>
        {steps.map((step, index) => (
          <Stack direction="row" spacing={0.75} alignItems="center" key={step.label} sx={{ flexShrink: 0 }}>
            <ButtonBase
              onClick={() => navigate(step.page.path.startsWith('/') ? step.page.path : `/${step.page.path}`)}
              sx={{
                px: 1.25,
                py: 0.75,
                minWidth: 118,
                border: '1px solid #dcdfe6',
                borderRadius: 1,
                bgcolor: step.page.code === currentPage?.code ? '#e3f2fd' : '#fff',
                justifyContent: 'flex-start',
                textAlign: 'left',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{step.label}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {step.page.title}
                </Typography>
              </Box>
            </ButtonBase>
            {index < steps.length - 1 ? <ArrowForward fontSize="small" color="disabled" /> : null}
          </Stack>
        ))}
      </Box>
    </Paper>
  );
}
