import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import GridViewOutlined from '@mui/icons-material/GridViewOutlined';
import TuneRounded from '@mui/icons-material/TuneRounded';
import ViewListOutlined from '@mui/icons-material/ViewListOutlined';
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import CanvasDesignerToolbar from '../../components/canvas/CanvasDesignerToolbar';
import CanvasPageThumbnails from '../../components/canvas/CanvasPageThumbnails';
import CanvasSheetWorkspace from '../../components/canvas/CanvasSheetWorkspace';
import DesignerInspector from '../../components/DesignerInspector';
import DesignerSidebar from '../../components/DesignerSidebar';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';

const sideRailItems = [
  { id: 'thumbnails', title: '分页缩略图', tooltip: '分页', icon: <ArticleOutlined fontSize="small" /> },
  { id: 'fields', title: '字段管理', tooltip: '字段', icon: <ViewListOutlined fontSize="small" /> },
  { id: 'grid', title: '组件管理', tooltip: '组件', icon: <GridViewOutlined fontSize="small" /> },
  { id: 'config', title: '字段配置', tooltip: '配置', icon: <TuneRounded fontSize="small" /> },
] as const;

export default function CanvasTab() {
  const activeRail = useTemplateDesignerStore((state) => state.activeCanvasRail);
  const setActiveRail = useTemplateDesignerStore((state) => state.setActiveCanvasRail);
  const isSidebarVisible = useTemplateDesignerStore((state) => state.isCanvasSidebarVisible);
  const setIsSidebarVisible = useTemplateDesignerStore((state) => state.setCanvasSidebarVisible);
  const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const shouldShowConfigRail = Boolean(selectedNode?.bindings?.fieldId);
  const visibleSideRailItems = shouldShowConfigRail
    ? sideRailItems
    : sideRailItems.filter((item) => item.id !== 'config');
  const panelRail = activeRail === 'config' && !shouldShowConfigRail ? 'thumbnails' : activeRail;
  const activeRailItem = visibleSideRailItems.find((item) => item.id === panelRail) ?? visibleSideRailItems[0];

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
          {visibleSideRailItems.map((item) => (
            <Tooltip key={item.id} title={item.tooltip} placement="right">
              <Button
                onClick={() => {
                  setActiveRail(item.id);
                  setIsSidebarVisible(true);
                }}
                sx={{
                  minWidth: 0,
                  width: 28,
                  height: 28,
                  p: 0,
                  borderRadius: 1,
                  color: panelRail === item.id ? '#2990ff' : '#7b8794',
                  bgcolor: panelRail === item.id ? '#eaf5ff' : 'transparent',
                }}
              >
                {item.icon}
              </Button>
            </Tooltip>
          ))}
        </Box>
        {isSidebarVisible ? (
          <Box
            data-canvas-side-panel="true"
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
            {panelRail === 'thumbnails' ? <CanvasPageThumbnails onClose={() => setIsSidebarVisible(false)} title={activeRailItem.title} /> : (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#303133' }}>{activeRailItem.title}</Typography>
                  <Button
                    aria-label="关闭侧边栏"
                    onClick={() => setIsSidebarVisible(false)}
                    sx={{ minWidth: 28, width: 28, height: 28, p: 0, color: '#808792' }}
                  >
                    <CloseOutlined fontSize="small" />
                  </Button>
                </Box>
                {panelRail === 'fields' ? <DesignerSidebar /> : panelRail === 'config' ? <DesignerInspector /> : (
                  <Stack sx={{ p: 2.5, color: '#98a2b3', fontSize: 13 }}>
                    当前面板正在迁移中。
                  </Stack>
                )}
              </Box>
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
        ) : null}
        <CanvasSheetWorkspace />
      </Box>
    </Box>
  );
}
