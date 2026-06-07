import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

/**
 * Status color system — soft background + colored dot + dark text.
 * Avoids MUI's default filled Chip colors which are too heavy for data tables.
 */

type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary';

const STATUS_STYLE: Record<StatusTone, { bg: string; text: string; dot: string }> = {
  success:  { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  warning:  { bg: '#FFF8E1', text: '#F57F17', dot: '#FFA000' },
  error:    { bg: '#FFEBEE', text: '#C62828', dot: '#EF5350' },
  info:     { bg: '#E3F2FD', text: '#0277BD', dot: '#29B6F6' },
  default:  { bg: '#F5F5F5', text: '#5A6878', dot: '#B0BEC5' },
  primary:  { bg: '#E3F2FD', text: '#1565C0', dot: '#42A5F5' },
  secondary:{ bg: '#E0F2F1', text: '#00897B', dot: '#26A69A' },
};

interface StatusBadgeProps {
  label: string;
  color?: ChipProps['color'];
  size?: ChipProps['size'];
}

export default function StatusBadge({ label, color = 'default', size = 'small' }: StatusBadgeProps) {
  const tone = color as StatusTone;
  const style = STATUS_STYLE[tone] ?? STATUS_STYLE.default;

  return (
    <Chip
      size={size}
      label={
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: style.dot,
              flexShrink: 0,
            }}
          />
          {label}
        </span>
      }
      sx={{
        backgroundColor: style.bg,
        color: style.text,
        fontWeight: 500,
        border: 'none',
      }}
    />
  );
}
