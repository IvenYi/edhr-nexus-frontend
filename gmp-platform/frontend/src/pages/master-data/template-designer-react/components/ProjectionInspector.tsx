import { Box, Stack, Typography } from '@mui/material';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ModelField } from '../types/model';
import type { CanvasNode } from '../types/canvas';
import FieldProjectionConfig from './FieldProjectionConfig';
import SubTableProjectionConfig from './SubTableProjectionConfig';
import StatisticsProjectionConfig from './StatisticsProjectionConfig';

export default function ProjectionInspector() {
  const document = useTemplateDesignerStore(state => state.document);
  const selectedNode = useTemplateDesignerStore(state => state.getSelectedNode());
  const fieldId = selectedNode?.bindings?.fieldId;
  const table = document?.model.fields.find(field => field.type === 'subTable'
    && (field.id === selectedNode?.bindings?.subTableId
      || (Array.isArray(field.typeConfig.columns) && (field.typeConfig.columns as ModelField[]).some(column => column.id === fieldId))));
  const field = (selectedNode?.type === 'sub-table' ? table : undefined) ?? document?.model.fields.find(item => item.id === fieldId)
    ?? (table?.typeConfig.columns as ModelField[] | undefined)?.find(column => column.id === fieldId)
    ?? selectedNode?.bindings?.subTableField;
  const supported = field && ['text', 'number', 'datetime', 'singleSelect', 'subTable', 'reference'].includes(field.type);
  const editTable = () => {
    if (!table || !document) return;
    const find = (nodes: CanvasNode[]): CanvasNode | undefined => {
      for (const node of nodes) {
        if (node.type === 'sub-table' && (node.bindings?.fieldId === table.id || node.bindings?.subTableId === table.id)) return node;
        const child = find(node.children ?? []); if (child) return child;
      }
    };
    const page = document.canvas.pages.find(item => item.id === document.canvas.currentPageId);
    const node = find(page?.nodes ?? []);
    if (node) { const store = useTemplateDesignerStore.getState(); store.setSelectedNodeId(node.id); store.selectSubTableGroup(node.id); store.setActiveCanvasRail('projection'); }
  };
  const context = field?.type === 'subTable' ? `当前子表：${field.name}`
    : field && table ? `当前子表列：${table.name} / ${field.name}`
      : field ? `当前字段：${field.name}` : '选择配置来源';

  return <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
    <Box data-projection-source-context="true" sx={{ p: 2, flexShrink: 0, borderBottom: '1px solid #e4e7ed' }}>
      <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{context}</Typography>
    </Box>
    <Stack data-projection-panel-content="true" spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
      {!field ? <><Typography variant="body2" color="text.secondary">选择字段可配置追溯，选择子表可配置整表用途。</Typography><StatisticsProjectionConfig /></>
        : !supported ? <><Typography variant="body2" color="text.secondary">当前字段类型暂不支持追溯用途配置。</Typography>{!table && <StatisticsProjectionConfig selectedFieldId={field.id} />}</>
          : field.type === 'subTable' ? <SubTableProjectionConfig key={field.id} field={field} showIdentity={false} />
            : <FieldProjectionConfig key={field.id} field={field} tableId={table?.id} showIdentity={false} onEditTable={table ? editTable : undefined} />}
    </Stack>
  </Box>;
}
