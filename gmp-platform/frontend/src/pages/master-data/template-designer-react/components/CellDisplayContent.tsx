import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { CanvasNode } from '../types';

export default function CellDisplayContent({ node, recordIndex = 0 }: { node: CanvasNode; recordIndex?: number }) {
  const serial = node.props.commonComponentId === 'serial-number';
  const sx: SxProps<Theme> = {
    width: '100%', height: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden',
    display: 'flex', alignItems: 'center',
    justifyContent: node.style.textAlign === 'center' || serial ? 'center' : node.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
    fontSize: Number(node.style.fontSize) || 13, color: String(node.style.color ?? '#303133'),
    fontWeight: node.style.fontWeight as string | undefined,
    fontStyle: node.style.fontStyle as string | undefined,
    fontFamily: node.style.fontFamily as string | undefined,
    textDecoration: node.style.textDecoration as string | undefined,
    bgcolor: String(node.props.backgroundColor || 'transparent'),
    border: node.props.hasBorder ? '1px solid #d0d7e2' : undefined,
    boxSizing: 'border-box',
  };
  return <Box data-cell-display-component={String(node.props.commonComponentId)} sx={sx}>
    {node.type === 'static-image' ? (node.props.src ? <Box component="img" src={String(node.props.src)} alt={String(node.props.alt ?? '')} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '图片')
      : node.type === 'display-line' ? <Box sx={{ width: '100%', borderTop: '1px solid currentColor' }} />
      : node.type === 'display-header-columns' ? <><Box sx={{ flex: 1, minWidth: 0 }}>{String(node.props.leftText ?? '')}</Box><Box sx={{ flex: 1, minWidth: 0, textAlign: 'right', borderLeft: '1px solid #d0d7e2' }}>{String(node.props.rightText ?? '')}</Box></>
      : <Box component="span" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{serial ? recordIndex + 1 : String(node.props.text ?? '')}</Box>}
  </Box>;
}
