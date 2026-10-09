import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { ChevronLeftRounded, ChevronRightRounded, FitScreenRounded, InfoOutlined, RotateRightRounded, ZoomInRounded, ZoomOutRounded } from '@mui/icons-material';

export function documentGeometry(width: number, height: number, viewport: number, rotation: number, zoom: number | null) {
  const sideways = rotation % 180 !== 0;
  const scale = zoom ?? Math.max(1, viewport) / (sideways ? height : width);
  return { scale, width: (sideways ? height : width) * scale, height: (sideways ? width : height) * scale };
}

export default function ExecutionDocumentViewer({ documentKey, url, image, name, error, emptyMessage, page, pages, firstPage, lastPage, onPageChange }: {
  documentKey: string; url: string; image: boolean; name: string; error: string; emptyMessage: string;
  page: number; pages: number; firstPage: number; lastPage: number; onPageChange: (page: number) => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState(1);
  const [size, setSize] = useState({ url: '', width: 1, height: 1 });
  const [zoom, setZoom] = useState<number | null>(null);
  const rotationStorageKey = `execution:sop-rotation:${documentKey}`;
  const [rotation, setRotation] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(rotationStorageKey));
      return [0, 90, 180, 270].includes(saved) ? saved : 0;
    } catch { return 0; }
  });
  const [imageError, setImageError] = useState('');
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const observer = new ResizeObserver(() => setViewport(Math.max(1, body.clientWidth - 32)));
    observer.observe(body);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { bodyRef.current?.scrollTo(0, 0); setImageError(''); }, [url]);
  const ready = Boolean(url && image && size.url === url && !error && !imageError);
  const geometry = documentGeometry(size.width, size.height, viewport, rotation, zoom);
  const changeZoom = (delta: number) => setZoom(Math.min(4, Math.max(0.1, Math.round((geometry.scale + delta) * 100) / 100)));
  const fitWidth = () => { setZoom(null); bodyRef.current?.scrollTo(0, 0); };
  const rotate = () => {
    const next = (rotation + 90) % 360;
    setRotation(next);
    try { localStorage.setItem(rotationStorageKey, String(next)); } catch { /* 本地存储不可用时仍可旋转当前预览。 */ }
    bodyRef.current?.scrollTo(0, 0);
  };
  return <Box className="execution-document-viewer">
    <Box ref={bodyRef} className="execution-document-body" aria-label="eSOP 文档预览" aria-busy={Boolean(url && image && !ready && !imageError && !error)}>
      {error || imageError ? <Alert severity="error">{error || imageError}</Alert> : url ? image ? <>
        {!ready && <Box className="execution-document-empty"><CircularProgress size={24} /><Typography variant="body2">正在加载页面…</Typography></Box>}
        <Box className="execution-document-sheet" style={{ width: geometry.width, height: geometry.height, visibility: ready ? 'visible' : 'hidden' }}>
          <img src={url} alt={`工序 eSOP：${name}`} draggable={false}
            onLoad={event => setSize({ url, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            onError={() => setImageError('页面加载失败，请重新打开文档。')}
            style={{ width: size.width * geometry.scale, height: size.height * geometry.scale, transform: `translate(-50%, -50%) rotate(${rotation}deg)` }} />
        </Box>
      </> : <iframe title={name} src={url} /> : <Box className="execution-document-empty"><InfoOutlined /><Typography variant="body2">{emptyMessage}</Typography></Box>}
    </Box>
    <Box className="execution-document-controls" role="toolbar" aria-label="eSOP 阅读工具">
      <Box className="execution-document-control-group">
        <Tooltip title="缩小"><span><IconButton aria-label="缩小" disabled={!ready || geometry.scale <= 0.1} onClick={() => changeZoom(-0.1)}><ZoomOutRounded /></IconButton></span></Tooltip>
        <span className="execution-document-zoom" aria-label="页面显示百分比" aria-live="polite">{ready ? `${Math.round(geometry.scale * 100)}%` : '—'}</span>
        <Tooltip title="放大"><span><IconButton aria-label="放大" disabled={!ready || geometry.scale >= 4} onClick={() => changeZoom(0.1)}><ZoomInRounded /></IconButton></span></Tooltip>
      </Box>
      <span className="execution-document-control-divider" />
      <Box className="execution-document-control-group">
        <Tooltip title="适合窗口宽度"><span><Button className="execution-document-fit" aria-label="适合窗口宽度" aria-pressed={zoom === null} disabled={!ready} onClick={fitWidth} startIcon={<FitScreenRounded />}>适合宽度</Button></span></Tooltip>
        <Tooltip title="顺时针旋转 90°"><span><IconButton aria-label="顺时针旋转 90°" disabled={!ready} onClick={rotate}><RotateRightRounded /></IconButton></span></Tooltip>
      </Box>
      <span className="execution-document-control-divider" />
      <Box className="execution-document-control-group">
        <Tooltip title="上一页"><span><IconButton aria-label="上一页" disabled={!url || Boolean(error) || page <= firstPage} onClick={() => onPageChange(page - 1)}><ChevronLeftRounded /></IconButton></span></Tooltip>
        <span className="execution-document-page-count" aria-label={`当前第 ${page} 页，共 ${pages} 页`} aria-live="polite"><strong>{page}</strong><span>/</span>{pages}<span>页</span></span>
        <Tooltip title="下一页"><span><IconButton aria-label="下一页" disabled={!url || Boolean(error) || page >= lastPage} onClick={() => onPageChange(page + 1)}><ChevronRightRounded /></IconButton></span></Tooltip>
      </Box>
    </Box>
  </Box>;
}
