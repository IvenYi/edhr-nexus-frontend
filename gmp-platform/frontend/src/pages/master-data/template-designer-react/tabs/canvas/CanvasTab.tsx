import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import CropLandscapeOutlined from '@mui/icons-material/CropLandscapeOutlined';
import GridViewOutlined from '@mui/icons-material/GridViewOutlined';
import ViewListOutlined from '@mui/icons-material/ViewListOutlined';
import { Box, Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import CanvasDesignerToolbar from '../../components/canvas/CanvasDesignerToolbar';
import CanvasPageThumbnails from '../../components/canvas/CanvasPageThumbnails';
import CanvasSheetWorkspace from '../../components/canvas/CanvasSheetWorkspace';

const sideRailItems = [
  { id: 'thumbnails', icon: <ArticleOutlined fontSize="small" /> },
  { id: 'fields', icon: <ViewListOutlined fontSize="small" /> },
  { id: 'grid', icon: <GridViewOutlined fontSize="small" /> },
  { id: 'layout', icon: <CropLandscapeOutlined fontSize="small" /> },
] as const;

export default function CanvasTab() {
  const [activeRail, setActiveRail] = useState<(typeof sideRailItems)[number]['id']>('thumbnails');
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  useEffect(() => {
    if (!isResizingSidebar) {
      return undefined;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.max(250, Math.min(350, event.clientX - 50));
      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      <CanvasDesignerToolbar />
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box
          sx={{
            width: 50,
            borderRight: '1px solid #e7edf4',
            bgcolor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 1.5,
            gap: 1,
          }}
        >
          {sideRailItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => setActiveRail(item.id)}
              sx={{
                minWidth: 0,
                width: 28,
                height: 28,
                p: 0,
                borderRadius: 1,
                color: activeRail === item.id ? '#2990ff' : '#7b8794',
                bgcolor: activeRail === item.id ? '#eaf5ff' : 'transparent',
              }}
            >
              {item.icon}
            </Button>
          ))}
        </Box>
        <Box
          sx={{
            position: 'relative',
            width: sidebarWidth,
            minWidth: 250,
            maxWidth: 350,
            borderRight: '1px solid #e7edf4',
            bgcolor: '#fff',
            flexShrink: 0,
            minHeight: 0,
          }}
        >
          {activeRail === 'thumbnails' ? <CanvasPageThumbnails /> : (
            <Stack sx={{ p: 2.5, color: '#98a2b3', fontSize: 13 }}>
              当前阶段先还原分页缩略图和表格画布，其它侧边面板继续按 Vue 设计器迁移。
            </Stack>
          )}
          <Box
            data-thumbnail-resize="true"
            onMouseDown={() => setIsResizingSidebar(true)}
            sx={{
              position: 'absolute',
              top: 0,
              right: -3,
              width: 6,
              height: '100%',
              cursor: 'col-resize',
              zIndex: 3,
            }}
          />
        </Box>
        <CanvasSheetWorkspace />
      </Box>
    </Box>
  );
}
