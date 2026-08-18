import BorderAllOutlined from '@mui/icons-material/BorderAllOutlined';
import FormatAlignCenterOutlined from '@mui/icons-material/FormatAlignCenterOutlined';
import FormatAlignLeftOutlined from '@mui/icons-material/FormatAlignLeftOutlined';
import FormatAlignRightOutlined from '@mui/icons-material/FormatAlignRightOutlined';
import FormatBoldOutlined from '@mui/icons-material/FormatBoldOutlined';
import FormatColorFillOutlined from '@mui/icons-material/FormatColorFillOutlined';
import FormatColorTextOutlined from '@mui/icons-material/FormatColorTextOutlined';
import FormatItalicOutlined from '@mui/icons-material/FormatItalicOutlined';
import FormatUnderlinedOutlined from '@mui/icons-material/FormatUnderlinedOutlined';
import RedoOutlined from '@mui/icons-material/RedoOutlined';
import StrikethroughSOutlined from '@mui/icons-material/StrikethroughSOutlined';
import UndoOutlined from '@mui/icons-material/UndoOutlined';
import VerticalAlignBottomOutlined from '@mui/icons-material/VerticalAlignBottomOutlined';
import VerticalAlignCenterOutlined from '@mui/icons-material/VerticalAlignCenterOutlined';
import VerticalAlignTopOutlined from '@mui/icons-material/VerticalAlignTopOutlined';
import { Box, Button, Divider, Tooltip } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';
import type { CanvasSelectionRange } from '../../types';

const FONT_SIZE_OPTIONS = [9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36];
const DEFAULT_FONT_COLOR = '#303133';
const DEFAULT_BACKGROUND_COLOR = '#ffffff';
const DEFAULT_BORDER_COLOR = '#000000';
const COLOR_PICKER_COMMIT_DELAY_MS = 120;

type ColorCommitTarget =
  | { type: 'node'; nodeId: string }
  | { type: 'cell'; range: CanvasSelectionRange };

function ToolbarIconButton({
  active,
  children,
  'data-toolbar-border': borderMarker,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  'data-toolbar-border'?: string;
}) {
  return (
    <Tooltip title={label} arrow>
      <span>
        <Button
          aria-label={label}
          data-toolbar-border={borderMarker}
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

function ToolbarFontSizeSelect({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (size: number) => void;
  value: number;
  'data-toolbar-font-size'?: string;
}) {
  const options = FONT_SIZE_OPTIONS.includes(value)
    ? FONT_SIZE_OPTIONS
    : [...FONT_SIZE_OPTIONS, value].sort((first, second) => first - second);

  return (
    <Tooltip title={label} arrow>
      <Box
        aria-label={label}
        component="select"
        data-toolbar-font-size="true"
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(Number(event.target.value))}
        value={value}
        sx={{
          width: 58,
          height: 30,
          px: 0.75,
          border: '1px solid transparent',
          borderRadius: 1,
          color: '#5f6570',
          bgcolor: 'transparent',
          fontSize: 12,
          outline: 'none',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: '#e8ebf0',
          },
        }}
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </Box>
    </Tooltip>
  );
}

function ToolbarColorButton({
  children,
  color,
  captureTarget,
  label,
  onChange,
  'data-toolbar-background-color': backgroundColorMarker,
  'data-toolbar-font-color': fontColorMarker,
}: {
  children: ReactNode;
  color: string;
  captureTarget: () => ColorCommitTarget | null;
  label: string;
  onChange: (color: string, target: ColorCommitTarget | null) => void;
  'data-toolbar-background-color'?: string;
  'data-toolbar-font-color'?: string;
}) {
  const [draftColor, setDraftColor] = useState(color);
  const draftColorRef = useRef(color);
  const committedColorRef = useRef(color);
  const commitTimerRef = useRef<number | null>(null);
  const commitTargetRef = useRef<ColorCommitTarget | null>(null);
  const isColorEditingRef = useRef(false);
  const commitDraftColorRef = useRef<() => void>(() => {});

  const ensureColorTarget = useCallback(() => {
    if (!commitTargetRef.current) {
      commitTargetRef.current = captureTarget();
    }
    return commitTargetRef.current;
  }, [captureTarget]);

  const clearDraftColorCommit = useCallback(() => {
    if (commitTimerRef.current == null) return;
    window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = null;
  }, []);

  const commitDraftColor = useCallback(() => {
    clearDraftColorCommit();
    const nextColor = draftColorRef.current;
    const target = ensureColorTarget();
    isColorEditingRef.current = false;
    commitTargetRef.current = null;
    if (nextColor === committedColorRef.current) return;
    committedColorRef.current = nextColor;
    onChange(nextColor, target);
  }, [clearDraftColorCommit, ensureColorTarget, onChange]);
  commitDraftColorRef.current = commitDraftColor;

  const scheduleDraftColorCommit = useCallback(() => {
    clearDraftColorCommit();
    commitTimerRef.current = window.setTimeout(commitDraftColor, COLOR_PICKER_COMMIT_DELAY_MS);
  }, [clearDraftColorCommit, commitDraftColor]);

  useEffect(() => {
    if (isColorEditingRef.current) return;
    setDraftColor(color);
    draftColorRef.current = color;
    committedColorRef.current = color;
  }, [color]);

  useEffect(() => () => commitDraftColorRef.current(), []);

  const handleDraftColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextColor = event.target.value;
    isColorEditingRef.current = true;
    ensureColorTarget();
    draftColorRef.current = nextColor;
    setDraftColor(nextColor);
    scheduleDraftColorCommit();
  };

  return (
    <Tooltip title={label} arrow>
      <Button
        aria-label={label}
        component="label"
        data-toolbar-background-color={backgroundColorMarker}
        data-toolbar-font-color={fontColorMarker}
        sx={{
          minWidth: 34,
          width: 34,
          height: 30,
          p: 0,
          borderRadius: 1,
          color: '#5f6570',
          bgcolor: 'transparent',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            bgcolor: '#e8ebf0',
          },
        }}
      >
        {children}
        <Box
          sx={{
            position: 'absolute',
            left: 7,
            right: 7,
            bottom: 4,
            height: 3,
            borderRadius: 999,
            bgcolor: draftColor,
            border: '1px solid rgba(0,0,0,.12)',
          }}
        />
        <Box
          component="input"
          type="color"
          value={draftColor}
          onBlur={commitDraftColor}
          onChange={handleDraftColorChange}
          onFocus={() => {
            isColorEditingRef.current = true;
            commitTargetRef.current = captureTarget();
          }}
          onMouseDown={() => {
            isColorEditingRef.current = true;
            commitTargetRef.current = captureTarget();
          }}
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </Button>
    </Tooltip>
  );
}

function toBooleanTextDecoration(value: unknown, token: string) {
  return typeof value === 'string' && value.includes(token);
}

function normalizeFontSize(value: unknown) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 14;
}

function normalizeHexColor(value: unknown, fallback: string) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

export default function CanvasDesignerToolbar() {
  const selectedCellState = useTemplateDesignerStore((state) => state.getSelectedCellState());
  const selectedCell = useTemplateDesignerStore((state) => state.selectedCell);
  const selectedRange = useTemplateDesignerStore((state) => state.selectedRange);
  const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());
  const updateSelectedCellStyle = useTemplateDesignerStore((state) => state.updateSelectedCellStyle);
  const updateCellStyleInRange = useTemplateDesignerStore((state) => state.updateCellStyleInRange);
  const updateSelectedCellBorder = useTemplateDesignerStore((state) => state.updateSelectedCellBorder);
  const updateNodeProps = useTemplateDesignerStore((state) => state.updateNodeProps);
  const updateNodeStyle = useTemplateDesignerStore((state) => state.updateNodeStyle);
  const undoCanvasChange = useTemplateDesignerStore((state) => state.undoCanvasChange);
  const redoCanvasChange = useTemplateDesignerStore((state) => state.redoCanvasChange);
  const canUndoCanvasChange = useTemplateDesignerStore((state) => state.canUndoCanvasChange());
  const canRedoCanvasChange = useTemplateDesignerStore((state) => state.canRedoCanvasChange());

  const isTextComponent = selectedNode?.type === 'static-text';
  const cellStyle = isTextComponent ? selectedNode.style : selectedCellState?.style ?? {};
  const cellBorder = selectedCellState?.border;
  const fontColor = normalizeHexColor(cellStyle.color, DEFAULT_FONT_COLOR);
  const backgroundColor = normalizeHexColor(cellStyle.backgroundColor, DEFAULT_BACKGROUND_COLOR);
  const hasAllBorders = isTextComponent
    ? Boolean(selectedNode?.props.hasBorder ?? selectedNode?.style.hasBorder)
    : Boolean(cellBorder?.top && cellBorder.right && cellBorder.bottom && cellBorder.left);
  const dividerSx = { mx: 0.5, alignSelf: 'center', height: 20 };
  const captureColorTarget = (): ColorCommitTarget | null => {
    if (isTextComponent && selectedNode) {
      return { type: 'node', nodeId: selectedNode.id };
    }
    if (selectedRange) {
      return { type: 'cell', range: { ...selectedRange } };
    }
    if (selectedCell) {
      return {
        type: 'cell',
        range: {
          t: selectedCell.row,
          l: selectedCell.col,
          b: selectedCell.row,
          r: selectedCell.col,
        },
      };
    }
    return null;
  };
  const updateColorStyle = (patch: Record<string, unknown>, target: ColorCommitTarget | null) => {
    if (target?.type === 'node') {
      updateNodeStyle(target.nodeId, patch);
      return;
    }
    if (target?.type === 'cell') {
      updateCellStyleInRange(target.range, patch);
      return;
    }
    updateSelectedStyle(patch);
  };
  const updateSelectedStyle = (patch: Record<string, unknown>) => {
    if (isTextComponent && selectedNode) {
      updateNodeStyle(selectedNode.id, patch);
      return;
    }
    updateSelectedCellStyle(patch);
  };
  const updateSelectedBorder = (enabled: boolean) => {
    if (isTextComponent && selectedNode) {
      updateNodeProps(selectedNode.id, { hasBorder: enabled });
      return;
    }
    updateSelectedCellBorder(enabled ? {
      top: true,
      right: true,
      bottom: true,
      left: true,
      color: DEFAULT_BORDER_COLOR,
    } : null);
  };

  const setTextDecoration = (token: 'underline' | 'line-through') => {
    const current = String(cellStyle.textDecoration ?? '');
    const next = current.includes(token)
      ? current
          .split(' ')
          .filter((item) => item && item !== token)
          .join(' ')
      : [current, token].filter(Boolean).join(' ');
    updateSelectedStyle({ textDecoration: next || undefined });
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
      <ToolbarFontSizeSelect
        data-toolbar-font-size="true"
        label="字号"
        value={normalizeFontSize(cellStyle.fontSize)}
        onChange={(fontSize) => updateSelectedStyle({ fontSize })}
      />
      <ToolbarColorButton
        data-toolbar-font-color="true"
        color={fontColor}
        captureTarget={captureColorTarget}
        label="字体颜色"
        onChange={(color, target) => updateColorStyle({ color }, target)}
      >
        <FormatColorTextOutlined fontSize="small" />
      </ToolbarColorButton>
      <ToolbarIconButton active={cellStyle.fontWeight === 'bold'} label="加粗" onClick={() => updateSelectedStyle({ fontWeight: cellStyle.fontWeight === 'bold' ? undefined : 'bold' })}>
        <FormatBoldOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.fontStyle === 'italic'} label="斜体" onClick={() => updateSelectedStyle({ fontStyle: cellStyle.fontStyle === 'italic' ? undefined : 'italic' })}>
        <FormatItalicOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={toBooleanTextDecoration(cellStyle.textDecoration, 'underline')} label="下划线" onClick={() => setTextDecoration('underline')}>
        <FormatUnderlinedOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={toBooleanTextDecoration(cellStyle.textDecoration, 'line-through')} label="删除线" onClick={() => setTextDecoration('line-through')}>
        <StrikethroughSOutlined fontSize="small" />
      </ToolbarIconButton>
      <Divider orientation="vertical" flexItem sx={dividerSx} />
      <ToolbarIconButton
        data-toolbar-border="true"
        active={hasAllBorders}
        label="边框线"
        onClick={() => updateSelectedBorder(!hasAllBorders)}
      >
        <BorderAllOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarColorButton
        data-toolbar-background-color="true"
        color={backgroundColor}
        captureTarget={captureColorTarget}
        label="单元格背景颜色"
        onChange={(backgroundColor, target) => updateColorStyle({ backgroundColor }, target)}
      >
        <FormatColorFillOutlined fontSize="small" />
      </ToolbarColorButton>
      <ToolbarIconButton active={cellStyle.textAlign === 'left'} label="左对齐" onClick={() => updateSelectedStyle({ textAlign: 'left' })}>
        <FormatAlignLeftOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.textAlign === 'center'} label="居中对齐" onClick={() => updateSelectedStyle({ textAlign: 'center' })}>
        <FormatAlignCenterOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.textAlign === 'right'} label="右对齐" onClick={() => updateSelectedStyle({ textAlign: 'right' })}>
        <FormatAlignRightOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.verticalAlign === 'top'} label="顶部对齐" onClick={() => updateSelectedStyle({ verticalAlign: 'top' })}>
        <VerticalAlignTopOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.verticalAlign === 'middle'} label="垂直居中" onClick={() => updateSelectedStyle({ verticalAlign: 'middle' })}>
        <VerticalAlignCenterOutlined fontSize="small" />
      </ToolbarIconButton>
      <ToolbarIconButton active={cellStyle.verticalAlign === 'bottom'} label="底部对齐" onClick={() => updateSelectedStyle({ verticalAlign: 'bottom' })}>
        <VerticalAlignBottomOutlined fontSize="small" />
      </ToolbarIconButton>
    </Box>
  );
}
