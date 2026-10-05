import { Box, Stack, Typography } from '@mui/material';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ModelField } from '../types/model';
import FieldProjectionConfig from './FieldProjectionConfig';
import SubTableProjectionConfig from './SubTableProjectionConfig';

export default function ProjectionInspector() {
  const document = useTemplateDesignerStore(state => state.document);
  const selectedNode = useTemplateDesignerStore(state => state.getSelectedNode());
  const fieldId = selectedNode?.bindings?.fieldId;
  const table = document?.model.fields.find(field => field.type === 'subTable'
    && (field.id === selectedNode?.bindings?.subTableId
      || (Array.isArray(field.typeConfig.columns) && (field.typeConfig.columns as ModelField[]).some(column => column.id === fieldId))));
  const field = document?.model.fields.find(item => item.id === fieldId)
    ?? (table?.typeConfig.columns as ModelField[] | undefined)?.find(column => column.id === fieldId)
    ?? selectedNode?.bindings?.subTableField;
  const supported = field && (['text', 'number', 'singleSelect', 'subTable'].includes(field.type)
    || (field.type === 'reference' && field.typeConfig.sourceType === 'material'));
  const context = field?.type === 'subTable' ? `当前子表：${field.name}`
    : field && table ? `当前子表列：${table.name} / ${field.name}`
      : field ? `当前字段：${field.name}` : '选择配置来源';

  return <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
    <Box data-projection-source-context="true" sx={{ p: 2, flexShrink: 0, borderBottom: '1px solid #e4e7ed' }}>
      <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{context}</Typography>
    </Box>
    <Stack data-projection-panel-content="true" spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
      {!field ? <Typography variant="body2" color="text.secondary">在画布中选择字段或子表，配置查找与统计用途。子表可一次设置各列的用途。</Typography>
        : !supported ? <Typography variant="body2" color="text.secondary">当前字段类型暂不支持查找与统计配置。请选择文本、数值、单选、物料引用字段或子表。</Typography>
          : field.type === 'subTable' ? <SubTableProjectionConfig key={field.id} field={field} showIdentity={false} />
            : <FieldProjectionConfig key={field.id} field={field} tableId={table?.id} showIdentity={false} />}
    </Stack>
  </Box>;
}
