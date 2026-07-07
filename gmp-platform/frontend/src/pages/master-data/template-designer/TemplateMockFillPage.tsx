import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useSystemBranding } from '@/hooks/useSystemBranding';
import { loadTemplateMockFillSnapshot } from './templateDesignerBridge';

type CellRecord = Record<string, any>;

interface PaperSnapshot {
  rows?: Array<{ height?: number }>;
  cols?: Array<{ width?: number }>;
  cells?: CellRecord[][];
  mergedCells?: Array<{ l: number; r: number; t: number; b: number }>;
  padding?: { t?: number; r?: number; b?: number; l?: number };
}

interface SheetSnapshot {
  sheetId?: string;
  title?: string;
  paper?: PaperSnapshot;
}

interface DesignerJsonSnapshot {
  sheets?: SheetSnapshot[];
  paper?: PaperSnapshot;
}

function parseDesignerJson(input?: string) {
  if (!input) return null;
  try {
    const parsed = JSON.parse(input) as DesignerJsonSnapshot;
    if (Array.isArray(parsed.sheets)) return parsed;
    if (parsed.paper) return { sheets: [{ sheetId: 'runtime_sheet', title: '工作表 1', paper: parsed.paper }] };
    return null;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function normalizeSheets(snapshotJson: DesignerJsonSnapshot | null) {
  return (snapshotJson?.sheets ?? [])
    .map((sheet, index) => ({
      sheetId: sheet.sheetId || `sheet_${index + 1}`,
      title: sheet.title || `工作表 ${index + 1}`,
      paper: sheet.paper,
    }))
    .filter((sheet) => sheet.paper);
}

function findMerge(paper: PaperSnapshot, rowIndex: number, colIndex: number) {
  const row = rowIndex + 1;
  const col = colIndex + 1;
  return paper.mergedCells?.find((merge) => merge.t <= row && merge.b >= row && merge.l <= col && merge.r >= col);
}

function cellText(cell?: CellRecord) {
  if (!cell) return '';
  const value =
    cell.value ??
    cell.text ??
    cell.label ??
    cell.props?.label ??
    cell.props?.text ??
    cell.fieldMeta?.name ??
    cell.fieldMeta?.fieldName ??
    cell.fieldWidget?.name ??
    cell.fieldWidget?.label ??
    cell.paperWidget?.label;

  if (value !== undefined && value !== null) {
    return String(value);
  }

  if (Array.isArray(cell.multiFieldsContent)) {
    return cell.multiFieldsContent
      .map((item) => item?.fieldMeta?.name || item?.label || item?.name)
      .filter(Boolean)
      .join(' / ');
  }

  return '';
}

function isFillableCell(cell?: CellRecord) {
  if (!cell) return false;
  return Boolean(
    cell.fieldMeta ||
      cell.fieldWidget ||
      cell.refFieldKey ||
      cell.fieldKey ||
      cell.props?.fieldKey ||
      String(cell.type || '').toLowerCase().includes('field'),
  );
}

function normalizeCellStyle(cell?: CellRecord): CSSProperties {
  const style = cell?.style && typeof cell.style === 'object' ? cell.style : {};
  const reactStyle = Object.entries(style).reduce<Record<string, unknown>>((result, [key, value]) => {
    result[key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())] = value;
    return result;
  }, {});
  const whiteSpace = style?.['white-space'] ?? reactStyle.whiteSpace;
  const wordBreak = style?.['word-break'] ?? reactStyle.wordBreak;

  return {
    ...(reactStyle as CSSProperties),
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: whiteSpace === 'pre-line' ? 'pre-line' : 'pre-wrap',
    wordBreak: wordBreak === 'break-all' ? 'break-all' : 'normal',
  };
}

function SheetPreview({ sheet, resetSeed }: { sheet: SheetSnapshot; resetSeed: number }) {
  const paper = sheet.paper;
  if (!paper) return null;

  const rows = paper.rows?.length ? paper.rows : Array(20).fill({ height: 30 });
  const cols = paper.cols?.length ? paper.cols : Array(9).fill({ width: 80 });
  const cells = paper.cells ?? [];
  const padding = paper.padding ?? {};
  const width = cols.reduce((sum, col) => sum + (Number(col.width) || 80), 0) + (padding.l ?? 10) + (padding.r ?? 10);

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography sx={{ mb: 1, fontSize: 13, fontWeight: 600, color: '#303133' }}>{sheet.title}</Typography>
      <Box sx={{ overflow: 'auto', pb: 1 }}>
        <Box
          sx={{
            width,
            minWidth: 720,
            bgcolor: '#fff',
            p: `${padding.t ?? 10}px ${padding.r ?? 10}px ${padding.b ?? 10}px ${padding.l ?? 10}px`,
            border: '1px solid #dcdfe6',
            boxShadow: '0 8px 24px rgba(31, 41, 55, .08)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              {cols.map((col, index) => (
                <col key={`${sheet.sheetId}-col-${index}`} style={{ width: Number(col.width) || 80 }} />
              ))}
            </colgroup>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${sheet.sheetId}-row-${rowIndex}`} style={{ height: Number(row.height) || 30 }}>
                  {cols.map((_, colIndex) => {
                    const merge = findMerge(paper, rowIndex, colIndex);
                    if (merge && (merge.t !== rowIndex + 1 || merge.l !== colIndex + 1)) {
                      return null;
                    }

                    const cell = cells[rowIndex]?.[colIndex];
                    const label = cellText(cell);
                    const fillable = isFillableCell(cell);
                    return (
                      <td
                        key={`${sheet.sheetId}-cell-${rowIndex}-${colIndex}`}
                        rowSpan={merge ? merge.b - merge.t + 1 : 1}
                        colSpan={merge ? merge.r - merge.l + 1 : 1}
                        style={{
                          height: Number(row.height) || 30,
                          padding: fillable ? 4 : 6,
                          border: '1px solid #dcdfe6',
                          verticalAlign: 'middle',
                          background: '#fff',
                          color: '#303133',
                          fontSize: 13,
                          ...normalizeCellStyle(cell),
                        }}
                      >
                        {fillable ? (
                          <input
                            key={`${resetSeed}-${sheet.sheetId}-${rowIndex}-${colIndex}`}
                            data-template-mock-fill-input
                            placeholder={label || '请输入'}
                            aria-label={label || `第 ${rowIndex + 1} 行第 ${colIndex + 1} 列`}
                            style={{
                              width: '100%',
                              height: '100%',
                              minHeight: 28,
                              boxSizing: 'border-box',
                              border: '1px solid #c0c4cc',
                              borderRadius: 4,
                              padding: '4px 8px',
                              color: '#303133',
                              background: '#fff',
                              outline: 'none',
                            }}
                          />
                        ) : (
                          label
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
}

export default function TemplateMockFillPage() {
  useSystemBranding();
  const [resetSeed, setResetSeed] = useState(0);
  const [submitMessage, setSubmitMessage] = useState('');
  const sessionId = new URLSearchParams(window.location.search).get('sid');
  const snapshot = useMemo(() => loadTemplateMockFillSnapshot(sessionId), [sessionId]);
  const designerJson = useMemo(
    () => parseDesignerJson(snapshot?.designerPayload.canvasDesignJson || snapshot?.designerPayload.modelDesignJson),
    [snapshot],
  );
  const sheets = useMemo(() => normalizeSheets(designerJson), [designerJson]);

  return (
    <Box data-template-mock-fill-page sx={{ height: '100vh', minWidth: 0, bgcolor: '#f4f6fa', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: '0 0 auto', height: 56, px: 2.5, bgcolor: '#1f2329', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<ArrowBackRoundedIcon fontSize="small" />}
            onClick={() => window.close()}
            sx={{ color: 'rgba(255,255,255,.74)', flex: '0 0 auto' }}
          >
            关闭页面
          </Button>
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,.24)' }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              模拟填报
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: 12, color: 'rgba(255,255,255,.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {snapshot ? `${snapshot.templateName || '表单模板'} : ${snapshot.versionLabel || '-'}` : '快照已失效'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: '0 0 auto' }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<RestartAltRoundedIcon fontSize="small" />}
            onClick={() => setResetSeed((value) => value + 1)}
            disabled={!sheets.length}
            sx={{ color: 'rgba(255,255,255,.82)', border: '1px solid rgba(255,255,255,.14)' }}
          >
            重置
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveRoundedIcon fontSize="small" />}
            onClick={() => setSubmitMessage('模拟提交成功，当前数据仅用于预览，不会写入业务数据。')}
            disabled={!sheets.length}
            sx={{ bgcolor: '#444', '&:hover': { bgcolor: '#555' } }}
          >
            模拟提交
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflow: 'auto', p: 2.5 }}>
        {submitMessage ? (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSubmitMessage('')}>
            {submitMessage}
          </Alert>
        ) : null}
        {!snapshot ? (
          <Alert severity="warning">模拟填报数据已失效，请从设计器重新打开。</Alert>
        ) : sheets.length ? (
          <Stack spacing={2}>
            {sheets.map((sheet) => (
              <SheetPreview key={sheet.sheetId} sheet={sheet} resetSeed={resetSeed} />
            ))}
          </Stack>
        ) : (
          <Alert severity="info">当前设计器 JSON 中没有可预览的表单画布。</Alert>
        )}
      </Box>
    </Box>
  );
}
