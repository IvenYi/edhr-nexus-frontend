import { useMemo } from 'react';
import { Box, ButtonBase, Chip, Paper, Stack, Typography } from '@mui/material';
import { ArrowForward, Route } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GCT_EDHR_PAGES } from '../metadata/generatedPages';
import type { EdhrPageMeta } from '../types';

interface DemoChainPanelProps {
  currentPage?: EdhrPageMeta;
}

const chainSpecs = [
  { label: '基础建模', matcher: (page: EdhrPageMeta) => page.module === '基础建模' },
  { label: '工单', matcher: (page: EdhrPageMeta) => page.title.includes('工单') || page.label.includes('工单') },
  { label: '批次/SN', matcher: (page: EdhrPageMeta) => page.title.includes('批次') || page.title.includes('SN') || page.label.includes('批次') },
  { label: '生产执行', matcher: (page: EdhrPageMeta) => page.module === '生产管理' && page.type === 'execution' },
  { label: '检验执行', matcher: (page: EdhrPageMeta) => page.module === '检验管理' && page.type === 'execution' },
  { label: '放行', matcher: (page: EdhrPageMeta) => page.module === '放行管理' },
  { label: '表单/DHR', matcher: (page: EdhrPageMeta) => page.module === '记录管理' || page.title.includes('DHR') },
  { label: '打印', matcher: (page: EdhrPageMeta) => page.actions.some((action) => action.code.includes('print')) },
  { label: '追溯报表', matcher: (page: EdhrPageMeta) => page.module === '统计报表' || page.title.includes('追溯') },
];

export default function DemoChainPanel({ currentPage }: DemoChainPanelProps) {
  const navigate = useNavigate();
  const steps = useMemo(
    () =>
      chainSpecs.map((step) => ({
        ...step,
        page: GCT_EDHR_PAGES.find(step.matcher) ?? currentPage ?? GCT_EDHR_PAGES[0],
      })),
    [currentPage],
  );

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
