import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { RestartAlt, Search } from '@mui/icons-material';
import type { EdhrFieldMeta, EdhrPageMeta, EdhrQueryFilters } from '../types';
import { inferEdhrFieldType } from '../utils/fieldInfer';

interface EdhrQueryBarProps {
  page: EdhrPageMeta;
  query: EdhrQueryFilters;
  loading?: boolean;
  setQuery: (query: EdhrQueryFilters) => Promise<void>;
  resetQuery: () => Promise<void>;
}

export default function EdhrQueryBar({ page, query, loading = false, setQuery, resetQuery }: EdhrQueryBarProps) {
  const queryFields = useMemo(() => page.queryFields.slice(0, 8), [page.queryFields]);
  const [draft, setDraft] = useState<EdhrQueryFilters>(query);

  useEffect(() => {
    setDraft(query);
  }, [query, page.code]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await setQuery(draft);
  };

  const handleReset = async () => {
    setDraft({});
    await resetQuery();
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: '#fff',
      }}
    >
      <Grid container spacing={1.25} alignItems="center">
        {queryFields.length === 0 ? (
          <Grid item xs>
            <Typography variant="body2" color="text.secondary">
              当前页面暂无查询字段，可直接浏览列表数据。
            </Typography>
          </Grid>
        ) : (
          queryFields.map((field) => (
            <Grid item xs={12} sm={6} md={3} lg={2} key={field.id}>
              <QueryFieldInput
                field={field}
                page={page}
                value={draft[field.name] ?? ''}
                onChange={(value) => setDraft((current) => ({ ...current, [field.name]: value }))}
              />
            </Grid>
          ))
        )}
        <Grid item xs={12} md="auto">
          <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button
              type="submit"
              size="small"
              variant="contained"
              startIcon={<Search />}
              disabled={loading}
            >
              查询
            </Button>
            <Button
              type="button"
              size="small"
              variant="outlined"
              startIcon={<RestartAlt />}
              disabled={loading}
              onClick={handleReset}
            >
              重置
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}

interface QueryFieldInputProps {
  field: EdhrFieldMeta;
  page: EdhrPageMeta;
  value: unknown;
  onChange: (value: unknown) => void;
}

function QueryFieldInput({ field, page, value, onChange }: QueryFieldInputProps) {
  const fieldType = inferEdhrFieldType(field);

  if (fieldType === 'status') {
    const statusOptions = Array.from(new Set([...page.baseStatuses, ...page.businessStatuses, '草稿', '启用', '禁用']));
    return (
      <TextField
        select
        fullWidth
        size="small"
        label={field.label}
        value={String(value ?? '')}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">全部</MenuItem>
        {statusOptions.map((status) => (
          <MenuItem value={status} key={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return (
    <TextField
      fullWidth
      size="small"
      label={field.label}
      type={getInputType(fieldType)}
      value={formatInputValue(value, fieldType)}
      onChange={(event) => {
        const nextValue = event.target.value;
        onChange(fieldType === 'number' ? (event.target.value === '' ? '' : Number(nextValue)) : nextValue);
      }}
      InputLabelProps={fieldType === 'date' || fieldType === 'datetime' ? { shrink: true } : undefined}
    />
  );
}

function getInputType(fieldType: ReturnType<typeof inferEdhrFieldType>): string {
  if (fieldType === 'date') return 'date';
  if (fieldType === 'datetime') return 'datetime-local';
  if (fieldType === 'number') return 'number';
  return 'text';
}

function formatInputValue(value: unknown, fieldType: ReturnType<typeof inferEdhrFieldType>): string | number {
  if (value === undefined || value === null) return '';
  if (fieldType === 'datetime' && typeof value === 'string') return value.slice(0, 16);
  return value as string | number;
}
