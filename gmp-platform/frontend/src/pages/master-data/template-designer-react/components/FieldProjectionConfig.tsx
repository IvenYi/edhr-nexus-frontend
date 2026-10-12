import { Alert, Box, Button, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { useTemplateDesignerStore } from '../store/useTemplateDesignerStore';
import type { ModelField, ProjectionBinding } from '../types/model';
import { acceptsProjectionAttribute, useProjectionCatalog } from '../utils/projectionConfiguration';
import ProjectionRemoveButton from './ProjectionRemoveButton';
import StatisticsProjectionConfig from './StatisticsProjectionConfig';

export default function FieldProjectionConfig({ field, tableId, showIdentity = true, onEditTable }: {
  field: ModelField; tableId?: string; showIdentity?: boolean; onEditTable?: () => void;
}) {
  const document = useTemplateDesignerStore(state => state.document);
  const setBindings = useTemplateDesignerStore(state => state.setProjectionBindings);
  const { data: catalog, isPending, isError, refetch } = useProjectionCatalog();
  if (!document) return null;
  const bindings = document.model.projection?.bindings ?? [];
  const inRegion = bindings.filter(binding => (binding.tableId ?? '') === (tableId ?? ''));
  const traces = inRegion.filter(binding => binding.modelId === 'formTrace' && Object.values(binding.sources).includes(field.id));
  const statistical = inRegion.filter(binding => binding.modelId !== 'formTrace' && Object.values(binding.sources).includes(field.id));
  const traceModel = catalog?.models.find(model => model.id === 'formTrace');
  const candidates = traceModel?.attributes.filter(attribute => acceptsProjectionAttribute(field, attribute)
    && !traces.some(binding => binding.sources[attribute.id] === field.id)) ?? [];
  const update = (next: ProjectionBinding[]) => setBindings(next, catalog?.version);
  const table = document.model.fields.find(item => item.id === tableId);
  return <Stack spacing={2}>
    {showIdentity && <Typography fontWeight={600}>{field.name}</Typography>}
    {isPending && <Typography variant="body2" color="text.secondary">正在加载可用用途…</Typography>}
    {isError && <Alert severity="error" action={<Button size="small" onClick={() => void refetch()}>重试</Button>}>用途目录加载失败</Alert>}
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" fontWeight={600}>追溯</Typography>
        <Tooltip title={`关联这个字段记录的信息，可在追溯页面找到原表单${tableId ? '及具体行' : ''}。可关联多个兼容追溯项，填报方式不变。`}>
          <IconButton size="small" aria-label="字段追溯配置说明"><InfoOutlined fontSize="small" /></IconButton>
        </Tooltip>
      </Stack>
      {traces.flatMap(binding => Object.entries(binding.sources).filter(([, id]) => id === field.id).map(([itemId]) =>
        <Stack key={`${binding.id}/${itemId}`} direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="body2">{traceModel?.attributes.find(attribute => attribute.id === itemId)?.name ?? '追溯项已失效'}</Typography>
          <ProjectionRemoveButton label={`移除${traceModel?.attributes.find(attribute => attribute.id === itemId)?.name ?? '失效追溯项'}关联`} onClick={() => {
            const sources = { ...binding.sources }; delete sources[itemId];
            update(Object.keys(sources).length ? bindings.map(item => item.id === binding.id ? { ...item, sources } : item) : bindings.filter(item => item.id !== binding.id));
          }} />
        </Stack>))}
      {!!candidates.length && <TextField select size="small" fullWidth label="关联追溯项（可选）" value="" sx={{ mt: 1.5 }} onChange={event => {
        if (!event.target.value) return;
        update([...bindings, { id: crypto.randomUUID(), modelId: 'formTrace', enabled: true,
          ...(tableId ? { tableId } : {}), sources: { [event.target.value]: field.id } }]);
      }}><MenuItem value="">选择字段记录的信息</MenuItem>{candidates.map(attribute => <MenuItem key={attribute.id} value={attribute.id}>{attribute.name}</MenuItem>)}</TextField>}
      {traceModel && !candidates.length && !traces.length && <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>暂无适合此字段类型的追溯项。</Typography>}
    </Box>
    <Box sx={{ borderTop: '1px solid #e4e7ed', pt: 1.5 }}>
      {tableId ? <Stack spacing={1}>
        <Typography variant="body2" fontWeight={600}>整张子表的业务统计</Typography>
        <Typography variant="caption" color="text.secondary">统计配置来自“{table?.name ?? '子表'}”，各列一起描述同一行业务。</Typography>
        {statistical.map(binding => {
          const definition = catalog?.models.find(model => model.id === binding.modelId);
          const roles = Object.entries(binding.sources).filter(([, id]) => id === field.id).map(([id]) => definition?.attributes.find(attribute => attribute.id === id)?.name.replace(/（.*?）/g, '') ?? '已失效角色');
          return <Typography key={binding.id} variant="body2">{definition?.name ?? '用途已失效'}：本列作为{roles.join('、')}</Typography>;
        })}
        {!statistical.length && <Typography variant="caption" color="text.secondary">本列尚未参与统计。</Typography>}
        {onEditTable && <Button size="small" variant="outlined" onClick={onEditTable}>切换到“{table?.name ?? '子表'}”配置统计</Button>}
      </Stack> : <StatisticsProjectionConfig selectedFieldId={field.id} />}
    </Box>
  </Stack>;
}
