import { type ReactNode, type SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Delete, ImageOutlined, InfoOutlined, Save, UploadFile } from '@mui/icons-material';
import {
  deleteSystemFavicon,
  deleteSystemLogo,
  getMailTestRecipients,
  getSystemSettings,
  sendTestMail,
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

const LOGO_SIZE_MAX = 60;
const SIGNATURE_CHANGE_CYCLE_DAYS_MAX = 30;
const DEFAULT_SECURITY_SETTINGS = {
  forcePasswordChangeOnFirstLogin: true,
  passwordChangeCycleEnabled: false,
  passwordChangeCycleDays: 90,
  passwordComplexity: 'MEDIUM',
  passwordFailureLockThreshold: 5,
  passwordFailureLockMinutes: 30,
  idleLogoutMinutes: 30,
  tokenValidityMinutes: 480,
  forceSignatureOnFirstLogin: false,
  signatureChangeCycleEnabled: true,
  signatureChangeCycleDays: SIGNATURE_CHANGE_CYCLE_DAYS_MAX,
};

const DEFAULT_MAIL_SETTINGS = {
  emailEnabled: true,
  smtpHost: '',
  smtpPort: 25,
  smtpSslEnabled: false,
  smtpUsername: '',
  smtpPassword: '',
  mailFromName: '系统默认通知',
};

const PASSWORD_COMPLEXITY_OPTIONS = [
  { value: 'LOW', label: '低：不少于 6 位' },
  { value: 'MEDIUM', label: '中：不少于 8 位，包含字母和数字' },
  { value: 'HIGH', label: '高：不少于 10 位，包含字母、数字和特殊字符' },
];

function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeLogoSize(value?: number): number {
  if (!Number.isFinite(value)) return 32;
  return Math.min(Math.max(Number(value), 1), LOGO_SIZE_MAX);
}

function readLogoSizeInput(value: string): number {
  if (!value) return 1;
  return normalizeLogoSize(Number(value));
}

function normalizeSettings(settings?: SystemSettings): SystemSettings {
  return {
    ...DEFAULT_SYSTEM_BRANDING,
    ...DEFAULT_SECURITY_SETTINGS,
    ...(settings ?? {}),
    systemName: settings?.systemName?.trim() || DEFAULT_SYSTEM_BRANDING.systemName,
    browserTitle: settings?.browserTitle?.trim() || DEFAULT_SYSTEM_BRANDING.browserTitle,
    logoWidth: normalizeLogoSize(settings?.logoWidth),
    logoHeight: normalizeLogoSize(settings?.logoHeight),
    loginSubtitle: settings?.loginSubtitle?.trim() || DEFAULT_SYSTEM_BRANDING.loginSubtitle,
    loginDescription: settings?.loginDescription?.trim() || DEFAULT_SYSTEM_BRANDING.loginDescription,
    loginComplianceItems: settings?.loginComplianceItems?.trim() || DEFAULT_SYSTEM_BRANDING.loginComplianceItems,
    forcePasswordChangeOnFirstLogin: settings?.forcePasswordChangeOnFirstLogin ?? DEFAULT_SECURITY_SETTINGS.forcePasswordChangeOnFirstLogin,
    passwordChangeCycleEnabled: settings?.passwordChangeCycleEnabled ?? DEFAULT_SECURITY_SETTINGS.passwordChangeCycleEnabled,
    passwordChangeCycleDays: normalizePositiveNumber(settings?.passwordChangeCycleDays, DEFAULT_SECURITY_SETTINGS.passwordChangeCycleDays),
    passwordComplexity: settings?.passwordComplexity || DEFAULT_SECURITY_SETTINGS.passwordComplexity,
    passwordFailureLockThreshold: normalizePositiveNumber(settings?.passwordFailureLockThreshold, DEFAULT_SECURITY_SETTINGS.passwordFailureLockThreshold),
    passwordFailureLockMinutes: normalizePositiveNumber(settings?.passwordFailureLockMinutes, DEFAULT_SECURITY_SETTINGS.passwordFailureLockMinutes),
    idleLogoutMinutes: normalizePositiveNumber(settings?.idleLogoutMinutes, DEFAULT_SECURITY_SETTINGS.idleLogoutMinutes),
    tokenValidityMinutes: normalizePositiveNumber(settings?.tokenValidityMinutes, DEFAULT_SECURITY_SETTINGS.tokenValidityMinutes),
    forceSignatureOnFirstLogin: settings?.forceSignatureOnFirstLogin ?? DEFAULT_SECURITY_SETTINGS.forceSignatureOnFirstLogin,
    signatureChangeCycleEnabled: true,
    signatureChangeCycleDays: normalizeSignatureChangeCycleDays(settings?.signatureChangeCycleDays),
    emailEnabled: settings?.emailEnabled ?? DEFAULT_MAIL_SETTINGS.emailEnabled,
    smtpHost: settings?.smtpHost?.trim() || DEFAULT_MAIL_SETTINGS.smtpHost,
    smtpPort: normalizePositiveNumber(settings?.smtpPort, DEFAULT_MAIL_SETTINGS.smtpPort),
    smtpSslEnabled: settings?.smtpSslEnabled ?? DEFAULT_MAIL_SETTINGS.smtpSslEnabled,
    smtpUsername: settings?.smtpUsername?.trim() || DEFAULT_MAIL_SETTINGS.smtpUsername,
    mailFromName: settings?.mailFromName?.trim() || DEFAULT_MAIL_SETTINGS.mailFromName,
  };
}

function normalizePositiveNumber(value: unknown, fallback: number): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 1 ? numeric : fallback;
}

function normalizeSignatureChangeCycleDays(value: unknown): number {
  return Math.min(
    normalizePositiveNumber(value, DEFAULT_SECURITY_SETTINGS.signatureChangeCycleDays),
    SIGNATURE_CHANGE_CYCLE_DAYS_MAX,
  );
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

function Section({ title, titleExtra, children }: { title: string; titleExtra?: ReactNode; children: ReactNode }) {
  return (
    <Box sx={{ bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ height: 48, px: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${COLORS.divider}` }}>
        <Typography sx={{ color: COLORS.textPrimary, fontWeight: 600, fontSize: 14 }}>{title}</Typography>
        {titleExtra}
      </Box>
      <Stack spacing={2} sx={{ p: 2 }}>{children}</Stack>
    </Box>
  );
}

export default function SystemSettingsPage() {
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const { refreshBranding } = useSystemBranding();
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    systemName: '',
    browserTitle: '',
    logoWidth: 32,
    logoHeight: 32,
    loginSubtitle: '',
    loginDescription: '',
    loginComplianceItems: '',
    ...DEFAULT_SECURITY_SETTINGS,
    ...DEFAULT_MAIL_SETTINGS,
  });
  const [testRecipientUserId, setTestRecipientUserId] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const settingsQuery = useQuery({
    queryKey: ['system', 'settings'],
    queryFn: getSystemSettings,
  });

  const mailRecipientsQuery = useQuery({
    queryKey: ['system', 'settings', 'mail-test-recipients'],
    queryFn: getMailTestRecipients,
    enabled: activeTab === 2,
  });

  const settings = normalizeSettings(settingsQuery.data);

  useEffect(() => {
    if (!settingsQuery.data) return;
    const nextSettings = normalizeSettings(settingsQuery.data);
    setForm({
      systemName: nextSettings.systemName,
      browserTitle: nextSettings.browserTitle,
      logoWidth: normalizeLogoSize(nextSettings.logoWidth),
      logoHeight: normalizeLogoSize(nextSettings.logoHeight),
      loginSubtitle: nextSettings.loginSubtitle ?? '',
      loginDescription: nextSettings.loginDescription ?? '',
      loginComplianceItems: nextSettings.loginComplianceItems ?? '',
      forcePasswordChangeOnFirstLogin: Boolean(nextSettings.forcePasswordChangeOnFirstLogin),
      passwordChangeCycleEnabled: Boolean(nextSettings.passwordChangeCycleEnabled),
      passwordChangeCycleDays: normalizePositiveNumber(nextSettings.passwordChangeCycleDays, DEFAULT_SECURITY_SETTINGS.passwordChangeCycleDays),
      passwordComplexity: nextSettings.passwordComplexity ?? DEFAULT_SECURITY_SETTINGS.passwordComplexity,
      passwordFailureLockThreshold: normalizePositiveNumber(nextSettings.passwordFailureLockThreshold, DEFAULT_SECURITY_SETTINGS.passwordFailureLockThreshold),
      passwordFailureLockMinutes: normalizePositiveNumber(nextSettings.passwordFailureLockMinutes, DEFAULT_SECURITY_SETTINGS.passwordFailureLockMinutes),
      idleLogoutMinutes: normalizePositiveNumber(nextSettings.idleLogoutMinutes, DEFAULT_SECURITY_SETTINGS.idleLogoutMinutes),
      tokenValidityMinutes: normalizePositiveNumber(nextSettings.tokenValidityMinutes, DEFAULT_SECURITY_SETTINGS.tokenValidityMinutes),
      forceSignatureOnFirstLogin: Boolean(nextSettings.forceSignatureOnFirstLogin),
      signatureChangeCycleEnabled: true,
      signatureChangeCycleDays: normalizeSignatureChangeCycleDays(nextSettings.signatureChangeCycleDays),
      emailEnabled: Boolean(nextSettings.emailEnabled),
      smtpHost: nextSettings.smtpHost ?? '',
      smtpPort: normalizePositiveNumber(nextSettings.smtpPort, DEFAULT_MAIL_SETTINGS.smtpPort),
      smtpSslEnabled: Boolean(nextSettings.smtpSslEnabled),
      smtpUsername: nextSettings.smtpUsername ?? '',
      smtpPassword: '',
      mailFromName: nextSettings.mailFromName ?? '',
    });
  }, [settingsQuery.data]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const handleSmtpSslChange = (checked: boolean) => {
    setForm((current) => ({
      ...current,
      smtpSslEnabled: checked,
      smtpPort: checked && current.smtpPort === 25
        ? 465
        : (!checked && current.smtpPort === 465 ? 25 : current.smtpPort),
    }));
  };

  const smtpAccountHint = form.smtpUsername.trim()
    ? `完整邮箱地址，例如 xxxx.qq.com；您已将 ${form.smtpUsername.trim()} 做为发件的账号`
    : '完整邮箱地址，例如 xxxx.qq.com；您已将什么邮箱做为发件的账号';

  const refreshSettings = async (nextSettings?: SystemSettings) => {
    if (nextSettings) {
      queryClient.setQueryData(['system', 'settings'], nextSettings);
    }
    await queryClient.invalidateQueries({ queryKey: ['system', 'settings'] });
    await refreshBranding(nextSettings);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const systemName = form.systemName.trim();
      const browserTitle = form.browserTitle.trim();
      if (!systemName) throw new Error('系统名称不能为空');
      if (!browserTitle) throw new Error('浏览器标题不能为空');
      if (form.logoWidth > LOGO_SIZE_MAX) throw new Error('Logo 长度不能超过 60px');
      if (form.logoHeight > LOGO_SIZE_MAX) throw new Error('Logo 高度不能超过 60px');
      if (form.passwordChangeCycleDays < 1) throw new Error('密码修改周期不能小于 1 天');
      if (form.passwordFailureLockThreshold < 1) throw new Error('密码输错锁定次数不能小于 1 次');
      if (form.passwordFailureLockMinutes < 1) throw new Error('账号锁定时间不能小于 1 分钟');
      if (form.idleLogoutMinutes < 1) throw new Error('无操作自动登出时间不能小于 1 分钟');
      if (form.tokenValidityMinutes < 1) throw new Error('登录有效期不能小于 1 分钟');
      if (form.signatureChangeCycleDays < 1) throw new Error('签名密码修改周期不能小于 1 天');
      if (form.signatureChangeCycleDays > SIGNATURE_CHANGE_CYCLE_DAYS_MAX) throw new Error('签名密码修改周期不能超过 30 天');
      if (form.smtpPort < 1) throw new Error('SMTP 端口不能小于 1');
      if (form.emailEnabled && (!form.smtpHost.trim() || !form.smtpUsername.trim())) {
        throw new Error('启用邮箱服务后必须填写 SMTP 服务器和账号');
      }
      return updateSystemSettings({
        systemName,
        browserTitle,
        logoWidth: normalizeLogoSize(form.logoWidth),
        logoHeight: normalizeLogoSize(form.logoHeight),
        loginSubtitle: form.loginSubtitle.trim(),
        loginDescription: form.loginDescription.trim(),
        loginComplianceItems: form.loginComplianceItems.trim(),
        forcePasswordChangeOnFirstLogin: form.forcePasswordChangeOnFirstLogin,
        passwordChangeCycleEnabled: form.passwordChangeCycleEnabled,
        passwordChangeCycleDays: normalizePositiveNumber(form.passwordChangeCycleDays, DEFAULT_SECURITY_SETTINGS.passwordChangeCycleDays),
        passwordComplexity: form.passwordComplexity,
        passwordFailureLockThreshold: normalizePositiveNumber(form.passwordFailureLockThreshold, DEFAULT_SECURITY_SETTINGS.passwordFailureLockThreshold),
        passwordFailureLockMinutes: normalizePositiveNumber(form.passwordFailureLockMinutes, DEFAULT_SECURITY_SETTINGS.passwordFailureLockMinutes),
        idleLogoutMinutes: normalizePositiveNumber(form.idleLogoutMinutes, DEFAULT_SECURITY_SETTINGS.idleLogoutMinutes),
        tokenValidityMinutes: normalizePositiveNumber(form.tokenValidityMinutes, DEFAULT_SECURITY_SETTINGS.tokenValidityMinutes),
        forceSignatureOnFirstLogin: form.forceSignatureOnFirstLogin,
        signatureChangeCycleEnabled: true,
        signatureChangeCycleDays: normalizeSignatureChangeCycleDays(form.signatureChangeCycleDays),
        emailEnabled: form.emailEnabled,
        smtpHost: form.smtpHost.trim(),
        smtpPort: normalizePositiveNumber(form.smtpPort, DEFAULT_MAIL_SETTINGS.smtpPort),
        smtpSslEnabled: form.smtpSslEnabled,
        smtpUsername: form.smtpUsername.trim(),
        smtpPassword: form.smtpPassword,
        mailFromName: form.mailFromName.trim(),
      });
    },
    onSuccess: async (savedSettings) => {
      await refreshSettings(savedSettings);
      showSnackbar('系统设置已保存', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '系统设置保存失败'), 'error'),
  });

  const logoUploadMutation = useMutation({
    mutationFn: uploadSystemLogo,
    onSuccess: async (savedSettings) => {
      await refreshSettings(savedSettings);
      showSnackbar('系统 Logo 已上传', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '系统 Logo 上传失败'), 'error'),
  });

  const faviconUploadMutation = useMutation({
    mutationFn: uploadSystemFavicon,
    onSuccess: async (savedSettings) => {
      await refreshSettings(savedSettings);
      showSnackbar('浏览器标签 Icon 已上传', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '浏览器标签 Icon 上传失败'), 'error'),
  });

  const logoDeleteMutation = useMutation({
    mutationFn: deleteSystemLogo,
    onSuccess: async (savedSettings) => {
      await refreshSettings(savedSettings);
      showSnackbar('系统 Logo 已删除', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '系统 Logo 删除失败'), 'error'),
  });

  const faviconDeleteMutation = useMutation({
    mutationFn: deleteSystemFavicon,
    onSuccess: async (savedSettings) => {
      await refreshSettings(savedSettings);
      showSnackbar('浏览器标签 Icon 已删除', 'success');
    },
    onError: (error) => showSnackbar(getApiErrorMessage(error, '浏览器标签 Icon 删除失败'), 'error'),
  });

  const testMailMutation = useMutation({
    mutationFn: () => {
      if (!testRecipientUserId) throw new Error('请选择接收测试邮件的用户');
      return sendTestMail(testRecipientUserId);
    },
    onSuccess: (payload) => showSnackbar(`测试邮件已发送至 ${payload.recipientEmail}`, 'success'),
    onError: (error) => showSnackbar(getApiErrorMessage(error, '测试邮件发送失败'), 'error'),
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
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="保存后，当前页面、登录页、浏览器标题和浏览器网页图标会立即刷新；" arrow>
            <IconButton size="small" sx={{ color: COLORS.textDisabled }}>
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Save />} disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()} sx={{ height: 40 }}>
            保存设置
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: COLORS.pageBg, p: 2 }}>
        <Stack spacing={2} sx={{ maxWidth: 1120 }}>
          <Box sx={{ bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, overflow: 'hidden' }}>
            <Tabs value={activeTab} onChange={(_, value: number) => setActiveTab(value)} sx={{ minHeight: 44, px: 2, borderBottom: `1px solid ${COLORS.divider}`, '& .MuiTab-root': { minHeight: 44, minWidth: 88, px: 0, mr: 3, textTransform: 'none', fontSize: 14 } }}>
              <Tab label="基础设置" />
              <Tab label="安全设置" />
              <Tab label="邮箱设置" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            <>
              <Section title="基础信息">
                <TextField label="系统名称" value={form.systemName} onChange={(event) => setForm((current) => ({ ...current, systemName: event.target.value }))} required fullWidth sx={fieldSx} />
                <TextField label="浏览器标题" value={form.browserTitle} onChange={(event) => setForm((current) => ({ ...current, browserTitle: event.target.value }))} required fullWidth sx={fieldSx} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Logo 长度" type="number" value={form.logoWidth} onChange={(event) => setForm((current) => ({ ...current, logoWidth: readLogoSizeInput(event.target.value) }))} required fullWidth inputProps={{ min: 1, max: LOGO_SIZE_MAX }} helperText="单位 px，最大 60px" sx={fieldSx} />
                  <TextField label="Logo 高度" type="number" value={form.logoHeight} onChange={(event) => setForm((current) => ({ ...current, logoHeight: readLogoSizeInput(event.target.value) }))} required fullWidth inputProps={{ min: 1, max: LOGO_SIZE_MAX }} helperText="单位 px，最大 60px" sx={fieldSx} />
                </Stack>
              </Section>

              <Section title="登录页展示内容">
                <TextField label="登录页副标题" value={form.loginSubtitle} onChange={(event) => setForm((current) => ({ ...current, loginSubtitle: event.target.value }))} fullWidth sx={fieldSx} />
                <TextField label="登录页说明" value={form.loginDescription} onChange={(event) => setForm((current) => ({ ...current, loginDescription: event.target.value }))} fullWidth multiline minRows={2} />
                <TextField label="登录页标准卡片" value={form.loginComplianceItems} onChange={(event) => setForm((current) => ({ ...current, loginComplianceItems: event.target.value }))} fullWidth multiline minRows={3} helperText="一行一个卡片，格式：标题|说明" />
              </Section>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
                <AssetPanel title="系统 Logo" description="建议使用透明 PNG 或 SVG" previewUrl={settings.logoUrl} accept="image/svg+xml,image/png,image/jpeg,image/webp" inputRef={logoInputRef} uploading={logoUploadMutation.isPending} deleting={logoDeleteMutation.isPending} onUpload={(file) => logoUploadMutation.mutate(file)} onDelete={() => logoDeleteMutation.mutate()} />
                <AssetPanel title="浏览器标签 Icon" description="建议 48px * 48px，支持 ico、png、svg" previewUrl={settings.faviconUrl} accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml" inputRef={faviconInputRef} uploading={faviconUploadMutation.isPending} deleting={faviconDeleteMutation.isPending} onUpload={(file) => faviconUploadMutation.mutate(file)} onDelete={() => faviconDeleteMutation.mutate()} />
              </Box>
            </>
          ) : activeTab === 1 ? (
            <>
              <Section title="密码策略">
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormControlLabel control={<Switch checked={form.forcePasswordChangeOnFirstLogin} onChange={(_, checked) => setForm((current) => ({ ...current, forcePasswordChangeOnFirstLogin: checked }))} />} label="首次登录强制修改登录密码" />
                  <FormControlLabel control={<Switch checked={form.passwordChangeCycleEnabled} onChange={(_, checked) => setForm((current) => ({ ...current, passwordChangeCycleEnabled: checked }))} />} label="固定周期强制修改登录密码" />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField select label="登录密码复杂程度" value={form.passwordComplexity} onChange={(event) => setForm((current) => ({ ...current, passwordComplexity: event.target.value }))} fullWidth sx={fieldSx}>
                    {PASSWORD_COMPLEXITY_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </TextField>
                  <TextField label="密码修改周期" type="number" value={form.passwordChangeCycleDays} onChange={(event) => setForm((current) => ({ ...current, passwordChangeCycleDays: normalizePositiveNumber(event.target.value, DEFAULT_SECURITY_SETTINGS.passwordChangeCycleDays) }))} fullWidth sx={fieldSx} helperText="单位：天" inputProps={{ min: 1 }} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="密码输错几次开始锁定" type="number" value={form.passwordFailureLockThreshold} onChange={(event) => setForm((current) => ({ ...current, passwordFailureLockThreshold: normalizePositiveNumber(event.target.value, DEFAULT_SECURITY_SETTINGS.passwordFailureLockThreshold) }))} fullWidth sx={fieldSx} inputProps={{ min: 1 }} />
                  <TextField label="锁定时长" type="number" value={form.passwordFailureLockMinutes} onChange={(event) => setForm((current) => ({ ...current, passwordFailureLockMinutes: normalizePositiveNumber(event.target.value, DEFAULT_SECURITY_SETTINGS.passwordFailureLockMinutes) }))} fullWidth sx={fieldSx} helperText="单位：分钟" inputProps={{ min: 1 }} />
                </Stack>
              </Section>

              <Section title="账号验证策略">
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="无操作自动登出" type="number" value={form.idleLogoutMinutes} onChange={(event) => setForm((current) => ({ ...current, idleLogoutMinutes: normalizePositiveNumber(event.target.value, DEFAULT_SECURITY_SETTINGS.idleLogoutMinutes) }))} fullWidth sx={fieldSx} helperText="单位：分钟" inputProps={{ min: 1 }} />
                  <TextField label="token 有效期自动登出" type="number" value={form.tokenValidityMinutes} onChange={(event) => setForm((current) => ({ ...current, tokenValidityMinutes: normalizePositiveNumber(event.target.value, DEFAULT_SECURITY_SETTINGS.tokenValidityMinutes) }))} fullWidth sx={fieldSx} helperText="单位：分钟" inputProps={{ min: 1 }} />
                </Stack>
              </Section>

              <Section
                title="电子签名策略"
                titleExtra={(
                  <Tooltip title="当前系统使用电子签名认证密码复核；该策略会控制认证到期与首次认证强制要求。" arrow>
                    <InfoOutlined sx={{ fontSize: 18, color: COLORS.textDisabled }} />
                  </Tooltip>
                )}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormControlLabel control={<Switch checked={form.forceSignatureOnFirstLogin} onChange={(_, checked) => setForm((current) => ({ ...current, forceSignatureOnFirstLogin: checked }))} />} label="首次登录时强制验证" />
                  <FormControlLabel control={<Switch checked={true} disabled />} label="固定周期强制修改签名密码" />
                </Stack>
                <TextField label="签名密码修改周期" type="number" value={form.signatureChangeCycleDays} onChange={(event) => setForm((current) => ({ ...current, signatureChangeCycleDays: normalizePositiveNumber(event.target.value, DEFAULT_SECURITY_SETTINGS.signatureChangeCycleDays) }))} fullWidth sx={fieldSx} helperText="单位：天，最大 30 天" inputProps={{ min: 1, max: SIGNATURE_CHANGE_CYCLE_DAYS_MAX }} />
              </Section>
            </>
          ) : (
            <>
              <Section
                title="SMTP 发信配置"
                titleExtra={(
                  <Tooltip title="系统对外发送邮件，通知、告警、验证码都靠它" arrow>
                    <InfoOutlined sx={{ fontSize: 18, color: COLORS.textDisabled }} />
                  </Tooltip>
                )}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <FormControlLabel control={<Switch checked={form.emailEnabled} onChange={(_, checked) => setForm((current) => ({ ...current, emailEnabled: checked }))} />} label="启用邮箱服务" />
                  <FormControlLabel control={<Switch checked={form.smtpSslEnabled} onChange={(_, checked) => handleSmtpSslChange(checked)} />} label="启用 SMTP SSL/TLS" />
                </Stack>
                {form.emailEnabled && (
                  <>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField label="SMTP 服务器" value={form.smtpHost} onChange={(event) => setForm((current) => ({ ...current, smtpHost: event.target.value }))} fullWidth sx={fieldSx} helperText="对应邮箱服务商的 SMTP 域名，例如 smtp.xxx.com" />
                      <TextField label="SMTP 端口" type="number" value={form.smtpPort} onChange={(event) => setForm((current) => ({ ...current, smtpPort: normalizePositiveNumber(event.target.value, DEFAULT_MAIL_SETTINGS.smtpPort) }))} fullWidth sx={fieldSx} inputProps={{ min: 1 }} />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField label="SMTP 账号" value={form.smtpUsername} onChange={(event) => setForm((current) => ({ ...current, smtpUsername: event.target.value }))} fullWidth sx={fieldSx} helperText={smtpAccountHint} />
                      <TextField
                        label="SMTP 密码"
                        type="password"
                        value={form.smtpPassword}
                        onChange={(event) => setForm((current) => ({ ...current, smtpPassword: event.target.value }))}
                        fullWidth
                        sx={fieldSx}
                        helperText={settings.smtpPasswordConfigured ? '不是登录密码，是第三方客户端授权码，需要去邮箱网页端获取；已配置，留空保存则不修改' : '不是登录密码，是第三方客户端授权码，需要去邮箱网页端获取'}
                      />
                    </Stack>
                    <TextField label="发件人名称" value={form.mailFromName} onChange={(event) => setForm((current) => ({ ...current, mailFromName: event.target.value }))} fullWidth sx={fieldSx} />
                  </>
                )}
              </Section>

              {form.emailEnabled && (
                <Section title="发送测试邮件">
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
                    <TextField
                      select
                      label="接收用户"
                      value={testRecipientUserId}
                      onChange={(event) => setTestRecipientUserId(event.target.value)}
                      fullWidth
                      sx={fieldSx}
                      helperText="仅展示已配置邮箱的用户"
                      InputProps={{
                        endAdornment: mailRecipientsQuery.isFetching ? <InputAdornment position="end"><CircularProgress size={16} /></InputAdornment> : undefined,
                      }}
                      >
                      {!mailRecipientsQuery.isFetching && (mailRecipientsQuery.data ?? []).length === 0 && (
                        <MenuItem value="" disabled>暂无用户配置邮箱</MenuItem>
                      )}
                      {(mailRecipientsQuery.data ?? []).map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.displayName || user.username}（{user.email}）
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      variant="outlined"
                      disabled={!testRecipientUserId || testMailMutation.isPending}
                      onClick={() => testMailMutation.mutate()}
                      sx={{ height: 40, minWidth: 132 }}
                    >
                      {testMailMutation.isPending ? '发送中' : '发送测试邮件'}
                    </Button>
                  </Stack>
                </Section>
              )}
            </>
          )}
        </Stack>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
