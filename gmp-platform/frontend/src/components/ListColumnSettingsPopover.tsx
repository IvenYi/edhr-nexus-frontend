import { useRef, useState, type DragEvent } from 'react';
import { Box, Checkbox, Popover, Stack, Typography } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';

export type ListColumnOption<ColumnId extends string> = {
  id: ColumnId;
  label: string;
  fixed?: boolean;
};

export type ListColumnSettings<ColumnId extends string> = {
  version: number;
  order: ColumnId[];
  hidden: ColumnId[];
};

export function getCurrentUserPreferenceStorageKey(prefix: string) {
  if (typeof window === 'undefined') return `${prefix}anonymous`;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null') as { id?: string | number; username?: string; displayName?: string } | null;
    return `${prefix}${user?.id ?? user?.username ?? user?.displayName ?? 'anonymous'}`;
  } catch {
    return `${prefix}anonymous`;
  }
}

export function normalizeListColumnSettings<ColumnId extends string>(
  columns: readonly ListColumnOption<ColumnId>[],
  version: number,
  raw?: Partial<ListColumnSettings<ColumnId>> | null,
): ListColumnSettings<ColumnId> {
  const defaultOrder = columns.map((column) => column.id);
  if (!raw || raw.version !== version) return { version, order: defaultOrder, hidden: [] };
  const known = new Set(defaultOrder);
  const seen = new Set<ColumnId>();
  const ordered = [
    ...(raw.order ?? []).filter((id): id is ColumnId => known.has(id) && !seen.has(id) && (seen.add(id), true)),
    ...defaultOrder.filter((id) => !seen.has(id)),
  ];
  const fixedIds = columns.filter((column) => column.fixed).map((column) => column.id);
  const normalizedOrder = [
    ...ordered.filter((id) => !fixedIds.includes(id)),
    ...fixedIds.filter((id) => ordered.includes(id)),
  ];
  const hidden = (raw.hidden ?? []).filter((id): id is ColumnId => normalizedOrder.includes(id));
  return { version, order: normalizedOrder, hidden: hidden.length >= normalizedOrder.length ? hidden.slice(1) : hidden };
}

export function loadListColumnSettings<ColumnId extends string>(
  storageKey: string,
  columns: readonly ListColumnOption<ColumnId>[],
  version: number,
) {
  if (typeof window === 'undefined') return normalizeListColumnSettings(columns, version);
  try {
    return normalizeListColumnSettings(columns, version, JSON.parse(localStorage.getItem(storageKey) || 'null'));
  } catch {
    return normalizeListColumnSettings(columns, version);
  }
}

export function reorderListColumns<ColumnId extends string>(
  columns: readonly ListColumnOption<ColumnId>[],
  current: ListColumnSettings<ColumnId>,
  sourceId: ColumnId,
  targetId: ColumnId,
) {
  const source = columns.find((column) => column.id === sourceId);
  const target = columns.find((column) => column.id === targetId);
  if (!source || !target || source.fixed || target.fixed || sourceId === targetId) return current;
  const order = current.order.filter((id) => id !== sourceId);
  const targetIndex = order.indexOf(targetId);
  if (targetIndex < 0) return current;
  order.splice(targetIndex, 0, sourceId);
  return { ...current, order };
}

type ListColumnSettingsPopoverProps<ColumnId extends string> = {
  anchorEl: HTMLElement | null;
  columns: readonly ListColumnOption<ColumnId>[];
  settings: ListColumnSettings<ColumnId>;
  onClose: () => void;
  onToggle: (columnId: ColumnId) => void;
  onReorder: (sourceId: ColumnId, targetId: ColumnId) => void;
};

export default function ListColumnSettingsPopover<ColumnId extends string>({ anchorEl, columns, settings, onClose, onToggle, onReorder }: ListColumnSettingsPopoverProps<ColumnId>) {
  const [draggingColumnId, setDraggingColumnId] = useState<ColumnId | null>(null);
  const dragSourceRef = useRef<ColumnId | null>(null);
  const visibleCount = settings.order.length - settings.hidden.length;
  const orderedColumns = settings.order.map((id) => columns.find((column) => column.id === id)).filter((column): column is ListColumnOption<ColumnId> => Boolean(column));

  const handleDragStart = (event: DragEvent<HTMLDivElement>, columnId: ColumnId) => {
    dragSourceRef.current = columnId;
    setDraggingColumnId(columnId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', columnId);
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: ColumnId) => {
    event.preventDefault();
    const sourceId = dragSourceRef.current ?? event.dataTransfer.getData('text/plain') as ColumnId;
    if (sourceId) onReorder(sourceId, targetId);
    dragSourceRef.current = null;
    setDraggingColumnId(null);
  };

  return <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    PaperProps={{ sx: { mt: 1, width: 240, border: '1px solid #e4e7ed', borderRadius: 1, boxShadow: '0 8px 24px rgba(0,0,0,.12)' } }}
  >
    <Stack spacing={0.5} sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ pb: 0.5 }}>列设置</Typography>
      {orderedColumns.map((column) => {
        const checked = !settings.hidden.includes(column.id);
        const disabled = checked && visibleCount <= 1;
        return <Box
          key={column.id}
          draggable={!column.fixed}
          onDragStart={(event) => { if (!column.fixed) handleDragStart(event, column.id); }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, column.id)}
          onDragEnd={() => { dragSourceRef.current = null; setDraggingColumnId(null); }}
          sx={{ display: 'grid', gridTemplateColumns: '24px 34px minmax(0, 1fr)', alignItems: 'center', minHeight: 40, borderRadius: 1, cursor: column.fixed ? 'default' : 'move', color: checked ? '#1890ff' : '#a8abb2', opacity: draggingColumnId === column.id ? 0.55 : 1, '&:hover': { bgcolor: '#f5f7fa' } }}
        >
          <DragIndicator fontSize="small" sx={{ color: column.fixed ? '#dcdfe6' : '#909399' }} />
          <Checkbox size="small" checked={checked} disabled={disabled} onChange={() => onToggle(column.id)} onClick={(event) => event.stopPropagation()} sx={{ p: 0.5 }} inputProps={{ 'aria-label': `${column.label}字段显隐` }} />
          <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{column.label}</Typography>
        </Box>;
      })}
    </Stack>
  </Popover>;
}
