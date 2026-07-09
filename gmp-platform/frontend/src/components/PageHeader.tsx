import { Box, Typography, Breadcrumbs, Link, Stack } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Breadcrumb trail */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons / elements on the right side */
  actions?: ReactNode;
  /** Called when a breadcrumb is clicked */
  onBreadcrumbClick?: (path: string) => void;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onBreadcrumbClick,
}: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 1.5 }}
        >
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return isLast || !item.path ? (
              <Typography key={item.label} variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                {item.label}
              </Typography>
            ) : (
              <Link
                key={item.label}
                underline="hover"
                color="text.secondary"
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  onBreadcrumbClick?.(item.path!);
                }}
                sx={{ fontSize: 13, cursor: 'pointer' }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={1.5}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: subtitle ? 0.5 : 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1} alignItems="center">
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
