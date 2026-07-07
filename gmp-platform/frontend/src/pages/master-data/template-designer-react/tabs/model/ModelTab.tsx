import { Button, List, ListItemButton, ListItemText, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import PropertyFormRenderer from '../../components/PropertyFormRenderer';
import { fieldRegistry, getFieldTypeDefinition } from '../../registry/fieldRegistry';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';

export default function ModelTab() {
  const document = useTemplateDesignerStore((state) => state.document);
  const selectedFieldId = useTemplateDesignerStore((state) => state.selectedFieldId);
  const setSelectedFieldId = useTemplateDesignerStore((state) => state.setSelectedFieldId);
  const addField = useTemplateDesignerStore((state) => state.addField);
  const updateField = useTemplateDesignerStore((state) => state.updateField);

  const fields = document?.model.fields ?? [];
  const selectedField = fields.find((field) => field.id === selectedFieldId) ?? fields[0] ?? null;
  const selectedFieldDefinition = selectedField ? getFieldTypeDefinition(selectedField.type) : null;

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ height: '100%' }}>
      <Paper sx={{ width: { xs: '100%', md: 320 }, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>字段模型</Typography>
          <Button
            variant="contained"
            onClick={() => {
              const field = addField('input');
              setSelectedFieldId(field.id);
            }}
          >
            新增字段
          </Button>
        </Stack>
        <List dense disablePadding>
          {fields.map((field) => (
            <ListItemButton
              key={field.id}
              selected={field.id === selectedField?.id}
              onClick={() => setSelectedFieldId(field.id)}
            >
              <ListItemText primary={field.name || '未命名字段'} secondary={`${field.code || '-'} / ${field.type}`} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Paper sx={{ flex: 1, p: 2 }}>
        {selectedField ? (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>字段配置</Typography>
            <TextField
              select
              size="small"
              label="字段类型"
              value={selectedField.type}
              onChange={(event) => updateField(selectedField.id, { type: event.target.value })}
              sx={{ maxWidth: 320 }}
            >
              {fieldRegistry.map((fieldType) => (
                <MenuItem key={fieldType.type} value={fieldType.type}>
                  {fieldType.label}
                </MenuItem>
              ))}
            </TextField>
            <PropertyFormRenderer
              schema={selectedFieldDefinition?.configSchema ?? []}
              value={selectedField as unknown as Record<string, unknown>}
              onChange={(patch) => updateField(selectedField.id, patch)}
            />
          </Stack>
        ) : (
          <Typography color="text.secondary">暂无字段，请先点击“新增字段”。</Typography>
        )}
      </Paper>
    </Stack>
  );
}
