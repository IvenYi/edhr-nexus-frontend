import { Box, Typography, Button } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Consistent empty state placeholder — replaces bare "暂无数据" text.
 */
export default function EmptyState({
  icon,
  title = '暂无数据',
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        color: 'text.disabled',
      }}
    >
      {icon ?? <InboxOutlined sx={{ fontSize: 56, opacity: 0.5 }} />}
      <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 360, textAlign: 'center' }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button variant="outlined" onClick={action.onClick} sx={{ mt: 1 }}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
