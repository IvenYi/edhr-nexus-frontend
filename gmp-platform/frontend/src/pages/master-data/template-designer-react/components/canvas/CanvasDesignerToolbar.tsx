import FormatAlignCenterOutlined from '@mui/icons-material/FormatAlignCenterOutlined';
import FormatAlignJustifyOutlined from '@mui/icons-material/FormatAlignJustifyOutlined';
import FormatAlignLeftOutlined from '@mui/icons-material/FormatAlignLeftOutlined';
import FormatAlignRightOutlined from '@mui/icons-material/FormatAlignRightOutlined';
import FormatBoldOutlined from '@mui/icons-material/FormatBoldOutlined';
import FormatItalicOutlined from '@mui/icons-material/FormatItalicOutlined';
import FormatUnderlinedOutlined from '@mui/icons-material/FormatUnderlinedOutlined';
import MergeOutlined from '@mui/icons-material/MergeOutlined';
import RedoOutlined from '@mui/icons-material/RedoOutlined';
import SplitscreenOutlined from '@mui/icons-material/SplitscreenOutlined';
import StrikethroughSOutlined from '@mui/icons-material/StrikethroughSOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import UndoOutlined from '@mui/icons-material/UndoOutlined';
import UnfoldMoreOutlined from '@mui/icons-material/UnfoldMoreOutlined';
import VerticalAlignBottomOutlined from '@mui/icons-material/VerticalAlignBottomOutlined';
import VerticalAlignCenterOutlined from '@mui/icons-material/VerticalAlignCenterOutlined';
import VerticalAlignTopOutlined from '@mui/icons-material/VerticalAlignTopOutlined';
import ViewWeekOutlined from '@mui/icons-material/ViewWeekOutlined';
import { Box, Button, Divider, Tooltip } from '@mui/material';
import type { ReactNode } from 'react';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';

function ToolbarIconButton({
  active,
  children,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip title={label} arrow>
      <span>
        <Button
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          sx={{
            minWidth: 30,
            width: 30,
            height: 30,
            p: 0,
            borderRadius: 1,
            color: '#5f6570',
            bgcolor: active ? '#e8ebf0' : 'transparent',
            '&:hover': {
              bgcolor: '#e8ebf0',
            },
          }}
        >
          {children}
        </Button>
      </span>
    </Tooltip>
  );
}

function toBooleanTextDecoration(value: unknown, token: string) {
  return typeof value === 'string' && value.includes(token);
}

export default function CanvasDesignerToolbar() {
  const selectedCellState = useTemplateDesignerStore((state) => state.getSelectedCellState());
  const updateSelectedCellStyle = useTemplateDesignerStore((state) => state.updateSelectedCellStyle);
  const undoCanvasChange = useTemplateDesignerStore((state) => state.undoCanvasChange);
  const redoCanvasChange = useTemplateDesignerStore((state) => state.redoCanvasChange);
  const canUndoCanvasChange = useTemplateDesignerStore((state) => state.canUndoCanvasChange());
  const canRedoCanvasChange = useTemplateDesignerStore((state) => state.canRedoCanvasChange());

  const cellStyle = selectedCellState?.style ?? {};
  const dividerSx = { mx: 0.5, alignSelf: 'center', height: 20 };

  const setTextDecoration = (token: 'underline' | 'line-through') => {
    const current = String(cellStyle.textDecoration ?? '');
    const next = current.includes(token)
      ? current
          .split(' ')
          .filter((item) => item && item !== token)
          .join(' ')
      : [current, token].filter(Boolean).join(' ');
    updateSelectedCellStyle({ textDecoration: next || undefined });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        height: 46,
        px: 1.5,
        borderBottom: '1px solid #e3e8ef',
        bgcolor: '#fff',
        overflowX: 'auto',
      }}
    >
      <ToolbarIconButton disabled={!canUndoCanvasChange} label="撤销" onClick={undoCanvasChange}>
        <UndoOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton disabled={!canRedoCanvasChange} label="重做" onClick={redoCanvasChange}>
        <RedoOutlined fontSize="small" />
      </ToolbarIconButton>
      <Divider orientation="vertical" flexItem sx={dividerSx} />
      <ToolbarIconButton active={cellStyle.fontWeight === 'bold'} label="加粗" onClick={() => updateSelectedCellStyle({ fontWeight: cellStyle.fontWeight === 'bold' ? undefined : 'bold' })}>
        <FormatBoldOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.fontStyle === 'italic'} label="斜体" onClick={() => updateSelectedCellStyle({ fontStyle: cellStyle.fontStyle === 'italic' ? undefined : 'italic' })}>
        <FormatItalicOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={toBooleanTextDecoration(cellStyle.textDecoration, 'underline')} label="下划线" onClick={() => setTextDecoration('underline')}>
        <FormatUnderlinedOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={toBooleanTextDecoration(cellStyle.textDecoration, 'line-through')} label="删除线" onClick={() => setTextDecoration('line-through')}>
        <StrikethroughSOutlined fontSize="small" />
      </ToolbarIconButton>
      <Divider orientation="vertical" flexItem sx={dividerSx} />
      <ToolbarIconButton active={cellStyle.textAlign === 'left'} label="左对齐" onClick={() => updateSelectedCellStyle({ textAlign: 'left' })}>
        <FormatAlignLeftOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.textAlign === 'center'} label="居中对齐" onClick={() => updateSelectedCellStyle({ textAlign: 'center' })}>
        <FormatAlignCenterOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.textAlign === 'right'} label="右对齐" onClick={() => updateSelectedCellStyle({ textAlign: 'right' })}>
        <FormatAlignRightOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.verticalAlign === 'top'} label="顶部对齐" onClick={() => updateSelectedCellStyle({ verticalAlign: 'top' })}>
        <VerticalAlignTopOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.verticalAlign === 'middle'} label="垂直居中" onClick={() => updateSelectedCellStyle({ verticalAlign: 'middle' })}>
        <VerticalAlignCenterOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.verticalAlign === 'bottom'} label="底部对齐" onClick={() => updateSelectedCellStyle({ verticalAlign: 'bottom' })}>
        <VerticalAlignBottomOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.whiteSpace === 'normal'} label="自动换行" onClick={() => updateSelectedCellStyle({ whiteSpace: cellStyle.whiteSpace === 'normal' ? 'nowrap' : 'normal' })}>
        <FormatAlignJustifyOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton label="合并单元格" onClick={() => undefined}>
        <MergeOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton label="拆分单元格" onClick={() => undefined}>
        <SplitscreenOutlined fontSize="small" />
      </ToolbarIconButton>
      <Divider orientation="vertical" flexItem sx={dividerSx} />
      <ToolbarIconButton label="插入表格" onClick={() => undefined}>
        <TableChartOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton label="调整列宽" onClick={() => undefined}>
        <ViewWeekOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton label="调整行高" onClick={() => undefined}>
        <UnfoldMoreOutlined fontSize="small" />
      </ToolbarIconButton>
    </Box>
  );
}
