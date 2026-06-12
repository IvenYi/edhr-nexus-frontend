import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Delete, ImageOutlined, Save, UploadFile } from '@mui/icons-material';
import {
  deleteSystemFavicon,
  deleteSystemLogo,
  getSystemSettings,
  updateSystemSettings,
  uploadSystemFavicon,
  uploadSystemLogo,
  type SystemSettings,
} from '@/api/system';
import { DEFAULT_SYSTEM_BRANDING, useSystemBranding } from '@/hooks/useSystemBranding';

const COLORS = {
  primary: '#1890ff',
  primaryLight: '#e8f4ff',
  textPrimary: '#303133',
  textSecondary: '#606266',
  textDisabled: '#909399',
  divider: '#e4e7ed',
  pageBg: '#f6f8f9',
};

const fieldSx = {
  '& .MuiInputBase-root': { height: 40 },
};

function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeSettings(settings?: SystemSettings): SystemSettings {
  return {
    ...DEFAULT_SYSTEM_BRANDING,
    ...(settings ?? {}),
    systemName: settings?.systemName?.trim() || DEFAULT_SYSTEM_BRANDING.systemName,
    browserTitle: settings?.browserTitle?.trim() || DEFAULT_SYSTEM_BRANDING.browserTitle,
  };
}

interface AssetPanelProps {
  title: string;
  description: string;
  previewUrl?: string;
  accept: string;
  inputRef: React.RefObject<HTMLInputElement>;
  uploading: boolean;
  deleting: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

function AssetPanel({
  title,
  description,
  previewUrl,
  accept,
  inputRef,
  uploading,
  deleting,
  onUpload,
  onDelete,
}: AssetPanelProps) {
  return (
    <Box sx={{ border: `1px solid ${COLORS.divider}`, borderRadius: 1, bgcolor: '#fff', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 48, px: 2, borderBottom: `1px solid ${COLORS.divider}` }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: COLORS.textPrimary, fontWeight: 600, fontSize: 14 }}>{title}</Typography>
          <Typography sx={{ color: COLORS.textDisabled, fontSize: 12 }} noWrap>{description}</Typography>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <input
            ref={inputRef}
            hidden
            type="file"
            accept={accept}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              event.target.value = '';
            }}
          />
          <Tooltip title="上传" arrow>
            <span>
              <IconButton size="small" color="primary" disabled={uploading} onClick={() => inputRef.current?.click()} aria-label={`上传${title}`}>
                <UploadFile fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="删除" arrow>
            <span>
              <IconButton size="small" color="error" disabled={!previewUrl || deleting} onClick={onDelete} aria-label={`删除${title}`}>
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack alignItems="center" justifyContent="center" sx={{ height: 180, bgcolor: COLORS.pageBg }}>
        {previewUrl ? (
          <Box component="img" src={previewUrl} alt={title} sx={{ maxWidth: 160, maxHeight: 112, objectFit: 'contain' }} />
        ) : (
          <Stack alignItems="center" spacing={1} sx={{ color: COLORS.textDisabled }}>
            <ImageOutlined sx={{ fontSize: 42 }} />
            <Typography sx={{ fontSize: 13 }}>暂无预览</Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default function SystemSettingsPage() {
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const { refreshBranding } = useSystemBranding();
  const [form, setForm] = useState({ systemName: '', browserTitle: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const settingsQuery = useQuery({
    queryKey: ['system', 'settings'],
    queryFn: getSystemSettings,
  });

  const settings = normalizeSettings(settingsQuery.data);

  useEffect(() => {
    if (!settingsQuery.data) return;
    const nextSettings = normalizeSettings(settingsQuery.data);
    setForm({
      systemName: nextSettings.systemName,
      browserTitle: nextSettings.browserTitle,
    });
  }, [settingsQuery.data]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const refreshSettings = async () => {
    await queryClient.invalidateQueries({ queryKey: ['system', 'settings'] });
    await refreshBranding();
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const systemName = form.systemName.trim();
      const browserTitle = form.browserTitle.trim();
      if (!systemName) throw new Error('系统名称不能为空');
      if (!browserTitle) throw new Error('浏览器标题不能为空');
      return updateSystemSettings({ systemName, browserTitle });
    },
    onSuccess: async () => {
      await refreshSettings();
      showSnackbar('系统设置已保存', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '系统设置保存失败'), 'error'),
  });

  const logoUploadMutation = useMutation({
    mutationFn: uploadSystemLogo,
    onSuccess: async () => {
      await refreshSettings();
      showSnackbar('系统 Logo 已上传', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '系统 Logo 上传失败'), 'error'),
  });

  const faviconUploadMutation = useMutation({
    mutationFn: uploadSystemFavicon,
    onSuccess: async () => {
      await refreshSettings();
      showSnackbar('浏览器标签 Icon 已上传', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '浏览器标签 Icon 上传失败'), 'error'),
  });

  const logoDeleteMutation = useMutation({
    mutationFn: deleteSystemLogo,
    onSuccess: async () => {
      await refreshSettings();
      showSnackbar('系统 Logo 已删除', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '系统 Logo 删除失败'), 'error'),
  });

  const faviconDeleteMutation = useMutation({
    mutationFn: deleteSystemFavicon,
    onSuccess: async () => {
      await refreshSettings();
      showSnackbar('浏览器标签 Icon 已删除', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '浏览器标签 Icon 删除失败'), 'error'),
  });

  if (settingsQuery.isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: 'calc(100vh - 142px)', bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1 }}>
        <CircularProgress size={28} />
        <Typography sx={{ mt: 1, color: COLORS.textDisabled, fontSize: 14 }}>系统设置加载中</Typography>
      </Stack>
    );
  }

  if (settingsQuery.isError) {
    return (
      <Stack justifyContent="center" sx={{ height: 'calc(100vh - 142px)', bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, p: 2 }}>
        <Alert severity="error">系统设置加载失败，请刷新后重试</Alert>
      </Stack>
    );
  }

  return (
    <Box
      data-system-settings-page
      sx={{
        height: 'calc(100vh - 142px)',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        border: `1px solid ${COLORS.divider}`,
        borderRadius: 1,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 52, px: 2, borderBottom: `1px solid ${COLORS.divider}`, flexShrink: 0 }}>
        <Box>
          <Typography sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>系统设置</Typography>
          <Typography sx={{ color: COLORS.textDisabled, fontSize: 12 }}>维护系统名称、浏览器标题和品牌资源</Typography>
        </Box>
        <Button variant="contained" startIcon={<Save />} disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()} sx={{ height: 40 }}>
          保存设置
        </Button>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: COLORS.pageBg, p: 2 }}>
        <Stack spacing={2} sx={{ maxWidth: 960 }}>
          <Box sx={{ bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ height: 48, px: 2, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${COLORS.divider}` }}>
              <Typography sx={{ color: COLORS.textPrimary, fontWeight: 600, fontSize: 14 }}>基础信息</Typography>
            </Box>
            <Stack spacing={2} sx={{ p: 2 }}>
              <TextField
                label="系统名称"
                value={form.systemName}
                onChange={(event) => setForm((current) => ({ ...current, systemName: event.target.value }))}
                required
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="浏览器标题"
                value={form.browserTitle}
                onChange={(event) => setForm((current) => ({ ...current, browserTitle: event.target.value }))}
                required
                fullWidth
                sx={fieldSx}
              />
            </Stack>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
            <AssetPanel
              title="系统 Logo"
              description="建议使用透明 PNG 或 SVG"
              previewUrl={settings.logoUrl}
              accept="image/svg+xml,image/png,image/jpeg,image/webp"
              inputRef={logoInputRef}
              uploading={logoUploadMutation.isPending}
              deleting={logoDeleteMutation.isPending}
              onUpload={(file) => logoUploadMutation.mutate(file)}
              onDelete={() => logoDeleteMutation.mutate()}
            />
            <AssetPanel
              title="浏览器标签 Icon"
              description="建议 48px * 48px，支持 ico、png、svg"
              previewUrl={settings.faviconUrl}
              accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
              inputRef={faviconInputRef}
              uploading={faviconUploadMutation.isPending}
              deleting={faviconDeleteMutation.isPending}
              onUpload={(file) => faviconUploadMutation.mutate(file)}
              onDelete={() => faviconDeleteMutation.mutate()}
            />
          </Box>

          <Alert severity="info" sx={{ borderRadius: 1 }}>
            保存或更新品牌资源后，当前页面、登录页、浏览器标题和 favicon 会立即刷新。
          </Alert>
        </Stack>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
