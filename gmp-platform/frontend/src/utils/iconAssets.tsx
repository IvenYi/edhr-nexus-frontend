import { Box, type SxProps, type Theme } from '@mui/material';
import { ImageOutlined } from '@mui/icons-material';
import type { IconAsset } from '@/api/system';
import { renderBuiltinIcon } from '@/utils/builtinIcons';

export const ICON_ASSET_VALUE_PREFIX = 'asset:';

export function toIconAssetValue(fileId: string | number | null | undefined) {
  return fileId === null || fileId === undefined || fileId === '' ? '' : `${ICON_ASSET_VALUE_PREFIX}${fileId}`;
}

export function parseIconAssetFileId(value: string | null | undefined) {
  if (!value?.startsWith(ICON_ASSET_VALUE_PREFIX)) return '';
  return value.slice(ICON_ASSET_VALUE_PREFIX.length);
}

export function getPublicFilePreviewUrl(fileId: string | number | null | undefined) {
  return fileId === null || fileId === undefined || fileId === '' ? '' : `/api/v1/files/${fileId}/public-preview`;
}

export function getIconAssetPreviewUrl(icon: Pick<IconAsset, 'fileId' | 'previewUrl' | 'fileUrl'>) {
  if (icon.fileId) return getPublicFilePreviewUrl(icon.fileId);
  return icon.previewUrl || icon.fileUrl || '';
}

export function renderManagedIcon(iconValue: string | null | undefined, sx?: SxProps<Theme>) {
  const fileId = parseIconAssetFileId(iconValue);
  if (fileId) {
    return (
      <Box
        component="img"
        src={getPublicFilePreviewUrl(fileId)}
        alt=""
        sx={[{ width: '1em', height: '1em', objectFit: 'contain', display: 'block' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      />
    );
  }

  return renderBuiltinIcon(iconValue, sx ? { sx } : undefined);
}

export function getManagedIconLabel(iconValue: string | null | undefined, icons: IconAsset[]) {
  const fileId = parseIconAssetFileId(iconValue);
  if (!fileId) return iconValue || '';
  return icons.find((icon) => String(icon.fileId ?? '') === fileId)?.name ?? `自定义图标 ${fileId}`;
}

export function IconAssetFallback({ sx }: { sx?: SxProps<Theme> }) {
  return <ImageOutlined sx={sx} />;
}
