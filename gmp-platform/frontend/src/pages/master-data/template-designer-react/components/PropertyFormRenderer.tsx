import {
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { PropertySchemaItem } from '../types';

interface PropertyFormRendererProps {
  title?: string;
  schema: PropertySchemaItem[];
  value: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

export default function PropertyFormRenderer({
  title,
  schema,
  value,
  onChange,
}: PropertyFormRendererProps) {
  return (
    <Stack spacing={1.5}>
      {title ? <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography> : null}
      {schema.map((item) => {
        const currentValue = value[item.key] ?? item.defaultValue ?? '';

        if (item.editor === 'switch') {
          return (
            <FormControlLabel
              key={item.key}
              label={item.label}
              control={(
                <Switch
                  checked={Boolean(currentValue)}
                  onChange={(event) => onChange({ [item.key]: event.target.checked })}
                />
              )}
            />
          );
        }

        if (item.editor === 'select') {
          return (
            <TextField
              key={item.key}
              select
              size="small"
              label={item.label}
              value={String(currentValue)}
              onChange={(event) => onChange({ [item.key]: event.target.value })}
              fullWidth
            >
              {(item.options ?? []).map((option) => (
                <MenuItem key={`${item.key}:${option.value}`} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          );
        }

        return (
          <TextField
            key={item.key}
            size="small"
            label={item.label}
            type={item.editor === 'number' ? 'number' : 'text'}
            multiline={item.editor === 'textarea'}
            minRows={item.editor === 'textarea' ? 3 : undefined}
            value={String(currentValue)}
            onChange={(event) => onChange({ [item.key]: item.editor === 'number' ? Number(event.target.value) : event.target.value })}
            fullWidth
          />
        );
      })}
    </Stack>
  );
}
