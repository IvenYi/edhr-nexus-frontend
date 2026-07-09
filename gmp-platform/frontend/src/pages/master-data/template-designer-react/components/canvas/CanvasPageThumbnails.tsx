import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { Box, Button, Typography } from '@mui/material';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';

function buildColumnCount(columnCount: number) {
  return Array.from({ length: Math.min(columnCount, 9) }, (_, index) => index);
}

function buildRowCount(rowCount: number) {
  return Array.from({ length: Math.min(rowCount, 12) }, (_, index) => index);
}

export default function CanvasPageThumbnails() {
  const pages = useTemplateDesignerStore((state) => state.document?.canvas.pages ?? []);
  const currentPageId = useTemplateDesignerStore((state) => state.document?.canvas.currentPageId ?? '');
  const pagePreviewCounts = useTemplateDesignerStore((state) => state.pagePreviewCounts);
  const setCurrentPageId = useTemplateDesignerStore((state) => state.setCurrentPageId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          height: 36,
          borderBottom: '1px solid #e8edf4',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#303133' }}>分页缩略图</Typography>
        <Button sx={{ minWidth: 28, width: 28, height: 28, p: 0, color: '#808792' }}>
          <CloseOutlined fontSize="small" />
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5 }}>
        {pages.map((page, index) => {
          const isActive = page.id === currentPageId;
          const previewCount = Math.max(1, pagePreviewCounts[page.id] ?? 1);
          const cols = buildColumnCount(page.sheet.columnCount);
          const rows = buildRowCount(page.sheet.rowCount);
          return Array.from({ length: previewCount }, (_, previewIndex) => (
            <Button
              key={`${page.id}-${previewIndex + 1}`}
              onClick={() => setCurrentPageId(page.id)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'calc(100% - 8px)',
                maxWidth: 'none',
                mx: 'auto',
                mb: 1.5,
                px: 1.25,
                py: 1.25,
                borderRadius: '4px',
                border: isActive ? '1px solid #2990ff' : '1px solid transparent',
                bgcolor: isActive ? '#eaf5ff' : '#f8fafc',
                color: '#6b7280',
                '&:hover': {
                  bgcolor: isActive ? '#eaf5ff' : '#f0f4f8',
                },
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cols.length || 1}, 1fr)`,
                  gridTemplateRows: `repeat(${rows.length || 1}, 1fr)`,
                  width: 'clamp(78px, 44%, 118px)',
                  maxWidth: '100%',
                  aspectRatio: page.sheet.paperOrientation === 'landscape' ? '297 / 210' : '210 / 297',
                  bgcolor: '#fff',
                  boxShadow: '0 0 0 1px #e1e7ef inset',
                  overflow: 'hidden',
                }}
              >
                {rows.flatMap((row) => cols.map((col) => (
                  <Box
                    key={`${page.id}:${previewIndex}:${row}:${col}`}
                    sx={{
                      borderRight: '1px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0',
                      opacity: page.sheet.canvasMode === 'paper' ? 0.22 : 1,
                    }}
                  />
                )))}
              </Box>
              <Typography sx={{ mt: 1.1, fontSize: 14, color: '#667085' }}>第 {previewIndex + 1} 页</Typography>
            </Button>
          ));
        })}
        {!pages.length ? (
          <Typography sx={{ fontSize: 13, color: '#98a2b3' }}>第 1 页</Typography>
        ) : null}
      </Box>
    </Box>
  );
}
