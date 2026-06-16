import { type ChangeEvent, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet,
  ChatBubbleOutline,
  CloudOutlined,
  EmailOutlined,
  FileUploadOutlined,
  Forum,
  GitHub,
  KeyOutlined,
  Payments,
  PersonOutline,
  PhoneIphoneOutlined,
  PhotoCameraOutlined,
  Save,
  VerifiedUserOutlined,
} from '@mui/icons-material';
import {
  changeCurrentUserPassword,
  createPersonalSignature,
  getCurrentUser,
  updateCurrentUserProfile,
  uploadSignatureEvidence,
  uploadUserAvatar,
} from '@/api/identity';

const COLORS = {
  primary: '#1890ff',
  primaryBlue: '#4092ff',
  primaryLight: '#e8f4ff',
  textPrimary: '#303133',
  textSecondary: '#606266',
  textDisabled: '#909399',
  divider: '#e4e7ed',
  pageBg: '#f6f8f9',
};

const SETTINGS_TABS = ['基本信息', '账号绑定'] as const;
const AUTH_USER_CHANGE_EVENT = 'edhr:auth-user-change';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHINA_MOBILE_PATTERN = /^1[3-9]\d{9}$/;
const AVATAR_CROP_SIZE = 280;
const AVATAR_OUTPUT_SIZE = 512;
const SIGNATURE_PAD_WIDTH = 560;
const SIGNATURE_PAD_HEIGHT = 180;
const SIGNATURE_CONFIRMATION_KEYS = ['exclusiveControl', 'authorizedUse', 'legalEffect'] as const;

type BindingKey = 'qq' | 'wechat' | 'alipay' | 'weibo' | 'github' | 'paypal';
const BINDING_ITEMS: BindingKey[] = ['qq', 'wechat', 'alipay', 'weibo', 'github', 'paypal'];
type SignatureConfirmationKey = (typeof SIGNATURE_CONFIRMATION_KEYS)[number];

interface StoredUser {
  id?: string | number;
  username?: string;
  displayName?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarFileId?: string | number | null;
  avatarUrl?: string;
  birthday?: string | null;
  gender?: '男' | '女' | string | null;
  biography?: string | null;
  organizationName?: string | null;
  departmentIds?: string[];
  primaryDepartmentId?: string | null;
  latestSignatureId?: string | number | null;
  signatureCertifiedAt?: string | null;
  signatureAuthMethod?: string | null;
  roleNames?: string[];
  roleIds?: string[];
  permissions?: string[];
}

interface PersonalSettingsState {
  displayName: string;
  email: string;
  phone: string;
  organization: string;
  location: string;
  bindings: Record<BindingKey, string | null>;
}

interface SignatureState {
  password: string;
  meaning: string;
  confirmations: Record<SignatureConfirmationKey, boolean>;
  hasHandwrittenSignature: boolean;
  idCardFrontFile: File | null;
  idCardBackFile: File | null;
}

interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface CropOffset {
  x: number;
  y: number;
}

interface CropImageSize {
  width: number;
  height: number;
}

const defaultBindings: Record<BindingKey, string | null> = {
  qq: '1204505056',
  wechat: null,
  alipay: null,
  weibo: null,
  github: null,
  paypal: null,
};

const defaultSignatureConfirmations: Record<SignatureConfirmationKey, boolean> = {
  exclusiveControl: false,
  authorizedUse: false,
  legalEffect: false,
};

const defaultState: PersonalSettingsState = {
  displayName: '',
  email: '',
  phone: '',
  organization: '集团 - 事业群 - 技术部',
  location: '中国 • 广东省 • 深圳市',
  bindings: defaultBindings,
};

function buildSignatureStatements(account: string, name: string) {
  return [
    {
      key: 'exclusiveControl' as const,
      text: '本系统账号（{account}）及绑定的电子签名凭证由本人（{name}）专属持有、独立控制，不存在转借、共享或交由他人操作的情形；'
        .replace(/\{account\}/g, account)
        .replace(/\{name\}/g, name),
    },
    {
      key: 'authorizedUse' as const,
      text: '本人（{name}）授权该电子签名用于本系统内各类电子表单的审核、确认与批准等合规操作；'
        .replace(/\{name\}/g, name),
    },
    {
      key: 'legalEffect' as const,
      text: '所有以本账号（{account}）完成的电子签名行为，均代表本人（{name}）已完整审阅并确认对应表单的全部内容，与本人（{name}）手写签名具有同等法律效力，本人（{name}）对签署内容的真实性、准确性承担全部责任。'
        .replace(/\{account\}/g, account)
        .replace(/\{name\}/g, name),
    },
  ];
}

function readStoredUser(): StoredUser {
  const userJson = localStorage.getItem('user');
  if (!userJson) return {};
  try {
    return JSON.parse(userJson) as StoredUser;
  } catch {
    return {};
  }
}

function persistUser(nextUser: StoredUser) {
  localStorage.setItem('user', JSON.stringify(nextUser));
  window.dispatchEvent(new CustomEvent(AUTH_USER_CHANGE_EVENT));
}

function mergeUserData(currentUser: StoredUser, payload: StoredUser) {
  const nextUser: StoredUser = {
    ...readStoredUser(),
    ...currentUser,
    ...payload,
  };
  persistUser(nextUser);
  return nextUser;
}

function initials(value: string) {
  return value.trim().charAt(0) || '用';
}

function getContainedImageSize(width: number, height: number, frameSize = AVATAR_CROP_SIZE): CropImageSize {
  if (!width || !height) return { width: frameSize, height: frameSize };
  const ratio = width / height;
  if (ratio >= 1) {
    return { width: frameSize, height: frameSize / ratio };
  }
  return { width: frameSize * ratio, height: frameSize };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function loadCropImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!source.startsWith('data:')) image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('头像图片加载失败，请重新上传'));
    image.src = source;
  });
}

async function createCroppedAvatarFile(
  source: string,
  cropOffset: CropOffset,
  cropScale: number,
  originalFileName: string,
): Promise<File> {
  const image = await loadCropImage(source);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('头像裁剪失败，请重试');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
  const baseSize = getContainedImageSize(image.naturalWidth, image.naturalHeight);
  const displayWidth = baseSize.width * cropScale;
  const displayHeight = baseSize.height * cropScale;
  const imageLeft = (AVATAR_CROP_SIZE - displayWidth) / 2 + cropOffset.x;
  const imageTop = (AVATAR_CROP_SIZE - displayHeight) / 2 + cropOffset.y;
  const visibleLeft = clamp(0 - imageLeft, 0, displayWidth);
  const visibleTop = clamp(0 - imageTop, 0, displayHeight);
  const visibleRight = clamp(AVATAR_CROP_SIZE - imageLeft, 0, displayWidth);
  const visibleBottom = clamp(AVATAR_CROP_SIZE - imageTop, 0, displayHeight);
  const sourceX = (visibleLeft / displayWidth) * image.naturalWidth;
  const sourceY = (visibleTop / displayHeight) * image.naturalHeight;
  const sourceWidth = ((visibleRight - visibleLeft) / displayWidth) * image.naturalWidth;
  const sourceHeight = ((visibleBottom - visibleTop) / displayHeight) * image.naturalHeight;
  const frameScale = AVATAR_OUTPUT_SIZE / AVATAR_CROP_SIZE;
  const outputX = (imageLeft + visibleLeft) * frameScale;
  const outputY = (imageTop + visibleTop) * frameScale;
  const outputWidth = (visibleRight - visibleLeft) * frameScale;
  const outputHeight = (visibleBottom - visibleTop) * frameScale;
  if (sourceWidth > 0 && sourceHeight > 0 && outputWidth > 0 && outputHeight > 0) {
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, outputX, outputY, outputWidth, outputHeight);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('头像裁剪失败，请重试'));
        return;
      }
      const baseName = originalFileName.replace(/\.[^.]+$/, '') || 'avatar';
      resolve(new File([blob], `${baseName}.png`, { type: 'image/png' }));
    }, 'image/png');
  });
}

function prepareSignatureCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#1f2937';
  context.lineWidth = 2.4;
  context.lineCap = 'round';
  context.lineJoin = 'round';
}

function getSignatureCanvasPoint(canvas: HTMLCanvasElement, event: ReactPointerEvent<HTMLCanvasElement>) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function createSignaturePadFile(canvas: HTMLCanvasElement | null): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error('请完成手写签名'));
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('手写签名保存失败，请重试'));
        return;
      }
      resolve(new File([blob], 'handwritten-signature.png', { type: 'image/png' }));
    }, 'image/png');
  });
}

function extractUploadedFileId(payload: unknown): string {
  if (!payload || typeof payload !== 'object' || !('id' in payload)) return '';
  const id = (payload as { id?: string | number | null }).id;
  return id === null || id === undefined ? '' : String(id);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function getBindingSubtitle(bindingKey: BindingKey, value: string | null): string {
  if (value) return value;
  switch (bindingKey) {
    case 'wechat':
      return '当前未绑定绑定微信账号';
    case 'alipay':
      return '当前未绑定绑定支付宝账号';
    case 'weibo':
      return '当前未绑定绑定微博账号';
    case 'github':
      return '当前未绑定绑定Github账号';
    case 'paypal':
      return '当前未绑定绑定Paypal账号';
    default:
      return '';
  }
}

function getBindingTitle(bindingKey: BindingKey): string {
  switch (bindingKey) {
    case 'qq':
      return '绑定QQ';
    case 'wechat':
      return '绑定微信';
    case 'alipay':
      return '绑定支付宝';
    case 'weibo':
      return '绑定微博';
    case 'github':
      return '绑定Github';
    case 'paypal':
      return '绑定Paypal';
  }
}

function getBindingIcon(bindingKey: BindingKey) {
  switch (bindingKey) {
    case 'qq':
      return <ChatBubbleOutline />;
    case 'wechat':
      return <Forum />;
    case 'alipay':
      return <AccountBalanceWallet />;
    case 'weibo':
      return <CloudOutlined />;
    case 'github':
      return <GitHub />;
    case 'paypal':
      return <Payments />;
  }
}

export default function PersonalSettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureDrawingRef = useRef(false);
  const queryClient = useQueryClient();
  const [state, setState] = useState<PersonalSettingsState>(defaultState);
  const [signatureState, setSignatureState] = useState<SignatureState>({
    password: '',
    meaning: '个人设置确认',
    confirmations: defaultSignatureConfirmations,
    hasHandwrittenSignature: false,
    idCardFrontFile: null,
    idCardBackFile: null,
  });
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [emailBindingDialogOpen, setEmailBindingDialogOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [passwordState, setPasswordState] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarCropDialogOpen, setAvatarCropDialogOpen] = useState(false);
  const [cropImageSource, setCropImageSource] = useState('');
  const [cropFileName, setCropFileName] = useState('avatar.png');
  const [cropScale, setCropScale] = useState(1);
  const [cropOffset, setCropOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [cropImageSize, setCropImageSize] = useState<CropImageSize>({ width: 0, height: 0 });
  const [cropImageLoadFailed, setCropImageLoadFailed] = useState(false);
  const [cropSaving, setCropSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await getCurrentUser({ skipAuthRedirect: true });
      return response.data.data as StoredUser;
    },
  });

  const currentUser = useMemo(() => {
    const apiUser = userQuery.data ?? {};
    const storedUser = readStoredUser();
    return {
      ...storedUser,
      ...apiUser,
    };
  }, [userQuery.data]);

  useEffect(() => {
    const displayName = currentUser.displayName || currentUser.name || currentUser.username || '管理员';
    setState((current) => ({
      ...current,
      displayName,
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      organization: currentUser.organizationName || '-',
    }));
  }, [currentUser]);

  useEffect(() => {
    if (!signatureDialogOpen) return;
    window.setTimeout(() => prepareSignatureCanvas(signatureCanvasRef.current), 0);
  }, [signatureDialogOpen]);

  const cropDisplaySize = useMemo(() => {
    const baseSize = getContainedImageSize(cropImageSize.width, cropImageSize.height);
    return {
      width: baseSize.width * cropScale,
      height: baseSize.height * cropScale,
    };
  }, [cropImageSize, cropScale]);

  const nameValue = state.displayName.trim() || currentUser.displayName || currentUser.name || currentUser.username || '管理员';
  const accountValue = currentUser.username || '-';
  const signatureStatements = useMemo(
    () => buildSignatureStatements(String(accountValue), String(nameValue)),
    [accountValue, nameValue],
  );

  const showMessage = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const profileMutation = useMutation({
    mutationFn: async (nextState: PersonalSettingsState = state) => {
      const response = await updateCurrentUserProfile({
        displayName: nextState.displayName.trim(),
        email: nextState.email.trim(),
        phone: nextState.phone.trim(),
      });
      return response.data.data as StoredUser;
    },
    onSuccess: (payload) => {
      const nextUser = mergeUserData(currentUser, payload);
      queryClient.setQueryData(['auth', 'me'], nextUser);
      setEmailBindingDialogOpen(false);
      showMessage('个人设置已保存', 'success');
    },
    onError: (error) => showMessage(getErrorMessage(error, '个人设置保存失败'), 'error'),
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      await changeCurrentUserPassword({
        currentPassword: passwordState.currentPassword,
        newPassword: passwordState.newPassword,
        confirmPassword: passwordState.confirmPassword,
      });
    },
    onSuccess: () => {
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordDialogOpen(false);
      showMessage('密码修改成功', 'success');
    },
    onError: (error) => showMessage(getErrorMessage(error, '密码修改失败'), 'error'),
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadUserAvatar(file);
      return response.data.data as StoredUser;
    },
    onSuccess: (payload) => {
      const nextUser = mergeUserData(currentUser, payload);
      queryClient.setQueryData(['auth', 'me'], nextUser);
      setAvatarCropDialogOpen(false);
      setCropSaving(false);
      showMessage('头像上传成功', 'success');
    },
    onError: (error) => {
      setCropSaving(false);
      showMessage(getErrorMessage(error, '头像上传失败'), 'error');
    },
  });

  const signatureMutation = useMutation({
    mutationFn: async () => {
      const signatureFile = await createSignaturePadFile(signatureCanvasRef.current);
      const [signatureImageResponse, idCardFrontResponse, idCardBackResponse] = await Promise.all([
        uploadSignatureEvidence(signatureFile),
        uploadSignatureEvidence(signatureState.idCardFrontFile as File),
        uploadSignatureEvidence(signatureState.idCardBackFile as File),
      ]);
      const signatureImageFileId = extractUploadedFileId(signatureImageResponse.data.data);
      const idCardFrontFileId = extractUploadedFileId(idCardFrontResponse.data.data);
      const idCardBackFileId = extractUploadedFileId(idCardBackResponse.data.data);
      const response = await createPersonalSignature({
        password: signatureState.password,
        meaning: signatureState.meaning,
        signatureImageFileId,
        idCardFrontFileId,
        idCardBackFileId,
        statements: signatureStatements.map((statement) => ({
          key: statement.key,
          text: statement.text,
          confirmed: signatureState.confirmations[statement.key],
        })),
      });
      return response.data.data as {
        signatureId?: string;
        signedAt?: string;
        authMethod?: string;
      };
    },
    onSuccess: (payload) => {
      const nextUser = mergeUserData(currentUser, {
        latestSignatureId: payload.signatureId,
        signatureCertifiedAt: payload.signedAt,
        signatureAuthMethod: payload.authMethod,
      });
      setSignatureDialogOpen(false);
      setSignatureState((current) => ({
        ...current,
        password: '',
        confirmations: defaultSignatureConfirmations,
        hasHandwrittenSignature: false,
        idCardFrontFile: null,
        idCardBackFile: null,
      }));
      prepareSignatureCanvas(signatureCanvasRef.current);
      void userQuery.refetch();
      persistUser(nextUser);
      showMessage('电子签名认证成功', 'success');
    },
    onError: (error) => showMessage(getErrorMessage(error, '电子签名认证失败'), 'error'),
  });

  const resetCropState = () => {
    setCropScale(1);
    setCropOffset({ x: 0, y: 0 });
    setCropImageSize({ width: 0, height: 0 });
    setCropImageLoadFailed(false);
  };

  const handleOpenAvatarEditor = () => {
    if (!cropImageSource && avatarUrl) {
      setCropImageSource(avatarUrl);
      setCropFileName('avatar.png');
      resetCropState();
    }
    setAvatarCropDialogOpen(true);
  };

  const handleAvatarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenAvatarEditor();
    }
  };

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMessage('请上传图片文件', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSource(String(reader.result || ''));
      setCropFileName(file.name || 'avatar.png');
      resetCropState();
      setAvatarCropDialogOpen(true);
    };
    reader.onerror = () => showMessage('头像图片读取失败，请重新上传', 'error');
    reader.readAsDataURL(file);
  };

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCropImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    setCropImageLoadFailed(false);
    setCropImageSize({
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  };

  const handleCropImageError = () => {
    setCropImageLoadFailed(true);
    setCropImageSize({ width: 0, height: 0 });
  };

  const handleCropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!cropImageSource) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startOffset = cropOffset;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      setCropOffset({
        x: startOffset.x + moveEvent.clientX - startX,
        y: startOffset.y + moveEvent.clientY - startY,
      });
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleAvatarCropSave = async () => {
    if (!cropImageSource || cropImageLoadFailed) {
      showMessage('请先上传头像图片', 'error');
      return;
    }
    setCropSaving(true);
    try {
      const file = await createCroppedAvatarFile(cropImageSource, cropOffset, cropScale, cropFileName);
      avatarMutation.mutate(file);
    } catch (error) {
      setCropSaving(false);
      showMessage(getErrorMessage(error, '头像裁剪失败'), 'error');
    }
  };

  const handleOpenSignatureDialog = () => {
    setSignatureDialogOpen(true);
  };

  const handleOpenEmailBindingDialog = () => {
    setEmailDraft(state.email);
    setEmailBindingDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    if (passwordMutation.isPending) return;
    setPasswordDialogOpen(false);
    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSignaturePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const point = getSignatureCanvasPoint(canvas, event);
    signatureDrawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const handleSignaturePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !signatureDrawingRef.current) return;
    const point = getSignatureCanvasPoint(canvas, event);
    context.lineTo(point.x, point.y);
    context.stroke();
    setSignatureState((current) => current.hasHandwrittenSignature ? current : { ...current, hasHandwrittenSignature: true });
  };

  const handleSignaturePointerEnd = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    signatureDrawingRef.current = false;
  };

  const handleClearSignaturePad = () => {
    prepareSignatureCanvas(signatureCanvasRef.current);
    setSignatureState((current) => ({ ...current, hasHandwrittenSignature: false }));
  };

  const handleSignatureEvidenceChange = (side: 'front' | 'back', event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMessage('请上传图片格式的身份证材料', 'error');
      return;
    }
    setSignatureState((current) => ({
      ...current,
      idCardFrontFile: side === 'front' ? file : current.idCardFrontFile,
      idCardBackFile: side === 'back' ? file : current.idCardBackFile,
    }));
  };

  const handleSignatureConfirmationChange = (key: SignatureConfirmationKey, checked: boolean) => {
    setSignatureState((current) => ({
      ...current,
      confirmations: {
        ...current.confirmations,
        [key]: checked,
      },
    }));
  };

  const handleSave = () => {
    if (state.email.trim() && !EMAIL_PATTERN.test(state.email.trim())) {
      showMessage('请输入正确的邮箱地址', 'error');
      return;
    }
    if (state.phone.trim() && !CHINA_MOBILE_PATTERN.test(state.phone.trim())) {
      showMessage('请输入正确的手机', 'error');
      return;
    }
    profileMutation.mutate(state);
  };

  const handleEmailBindingSave = () => {
    const nextEmail = emailDraft.trim();
    if (nextEmail && !EMAIL_PATTERN.test(nextEmail)) {
      showMessage('请输入正确的邮箱地址', 'error');
      return;
    }
    const nextState = { ...state, email: nextEmail };
    setState(nextState);
    profileMutation.mutate(nextState);
  };

  const handlePasswordSubmit = () => {
    if (!passwordState.currentPassword.trim()) {
      showMessage('请输入当前密码', 'error');
      return;
    }
    if (!passwordState.newPassword.trim()) {
      showMessage('请输入新密码', 'error');
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      showMessage('两次输入的新密码不一致', 'error');
      return;
    }
    passwordMutation.mutate();
  };

  const handleSignatureSubmit = () => {
    if (!signatureState.password.trim()) {
      showMessage('请输入认证密码', 'error');
      return;
    }
    if (!signatureState.hasHandwrittenSignature) {
      showMessage('请完成手写签名', 'error');
      return;
    }
    if (!signatureState.idCardFrontFile) {
      showMessage('请上传身份证正面', 'error');
      return;
    }
    if (!signatureState.idCardBackFile) {
      showMessage('请上传身份证反面', 'error');
      return;
    }
    if (!allSignatureStatementsConfirmed) {
      showMessage('请逐条确认电子签名声明', 'error');
      return;
    }
    signatureMutation.mutate();
  };

  const handleBindingChange = (key: BindingKey, value: string) => {
    setState((current) => ({ ...current, bindings: { ...current.bindings, [key]: value || null } }));
  };

  const avatarUrl = currentUser.avatarUrl || '';
  const organizationValue = currentUser.organizationName || state.organization || '-';
  const certifiedAt = currentUser.signatureCertifiedAt ? String(currentUser.signatureCertifiedAt).replace('T', ' ').slice(0, 16) : '';
  const signatureStatus = certifiedAt ? '电子签名' : '电子签名未认证';
  const emailError = Boolean(state.email.trim() && !EMAIL_PATTERN.test(state.email.trim()));
  const emailDraftError = Boolean(emailDraft.trim() && !EMAIL_PATTERN.test(emailDraft.trim()));
  const phoneError = Boolean(state.phone.trim() && !CHINA_MOBILE_PATTERN.test(state.phone.trim()));
  const allSignatureStatementsConfirmed = signatureStatements.every((statement) => signatureState.confirmations[statement.key]);
  const canSubmitSignature = Boolean(
    signatureState.password.trim()
      && signatureState.hasHandwrittenSignature
      && signatureState.idCardFrontFile
      && signatureState.idCardBackFile
      && allSignatureStatementsConfirmed,
  );

  return (
    <Box
      data-personal-settings-page
      sx={{
        height: 'calc(100vh - 142px)',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', bgcolor: COLORS.pageBg, p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' },
            gap: 2,
            height: '100%',
            minHeight: 0,
          }}
        >
          <Box data-profile-summary-card sx={{ bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
            <Button
              variant="text"
              onClick={() => setPasswordDialogOpen(true)}
              sx={{
                position: 'absolute',
                top: 12,
                right: 14,
                minWidth: 0,
                height: 28,
                px: 0.5,
                color: COLORS.primary,
                fontSize: 14,
                zIndex: 1,
              }}
            >
              修改密码
            </Button>
            <Box sx={{ minHeight: 220, p: 2.5, pt: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ position: 'relative', mb: 1.5 }}>
                <Avatar
                  src={avatarUrl || undefined}
                  onClick={handleOpenAvatarEditor}
                  onKeyDown={handleAvatarKeyDown}
                  aria-label="打开头像裁剪"
                  role="button"
                  tabIndex={0}
                  sx={{
                    width: 92,
                    height: 92,
                    bgcolor: COLORS.primaryBlue,
                    color: '#fff',
                    fontSize: 34,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {!avatarUrl && initials(nameValue)}
                </Avatar>
                <IconButton
                  size="small"
                  aria-label="上传头像"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenAvatarEditor();
                  }}
                  disabled={avatarMutation.isPending}
                  sx={{
                    position: 'absolute',
                    right: -2,
                    bottom: -2,
                    width: 30,
                    height: 30,
                    bgcolor: '#fff',
                    border: `1px solid ${COLORS.divider}`,
                    '&:hover': { bgcolor: COLORS.primaryLight },
                  }}
                >
                  <PhotoCameraOutlined sx={{ fontSize: 17, color: COLORS.primary }} />
                </IconButton>
                <Box
                  component="input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatarFileChange}
                  sx={{ display: 'none' }}
                />
              </Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>{nameValue}</Typography>
              <Typography aria-label="所属组织" sx={{ mt: 1.25, maxWidth: '100%', fontSize: 15, color: COLORS.textSecondary, lineHeight: 1.5, wordBreak: 'break-all' }}>{organizationValue}</Typography>
            </Box>
            <Divider />
            <Stack spacing={1.25} sx={{ p: 2.25 }}>
              <InfoRow icon={<PersonOutline />} label="姓名" value={nameValue} />
              <InfoRow icon={<KeyOutlined />} label="账号" value={currentUser.username || '-'} />
              <InfoRow icon={<VerifiedUserOutlined />} label="角色" value={(currentUser.roleNames ?? []).join('/') || '-'} />
              <InfoRow icon={<PhoneIphoneOutlined />} label="手机" value={state.phone || '-'} />
              <InfoRow icon={<EmailOutlined />} label="邮箱" value={state.email || '-'} />
            </Stack>
            <Divider />
            <Box sx={{ p: 2.25, minHeight: 124 }}>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box sx={{ width: 22, color: COLORS.textDisabled, display: 'flex', justifyContent: 'center', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
                    <VerifiedUserOutlined sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography sx={{ minWidth: 48, fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.5 }}>电子签名</Typography>
                </Stack>
                <Box
                  sx={{
                    ml: '32px',
                    minHeight: 58,
                    border: '1px solid #c0c4cc',
                    borderStyle: 'dashed',
                    borderRadius: 1,
                    px: 1.5,
                    py: 1.25,
                    bgcolor: '#fafcff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.5 }}>
                      {signatureStatus}
                    </Typography>
                    {certifiedAt ? (
                      <Typography sx={{ mt: 0.5, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
                        认证于 {certifiedAt}
                      </Typography>
                    ) : null}
                  </Box>
                  <Button
                    variant="text"
                    onClick={handleOpenSignatureDialog}
                    sx={{ flex: '0 0 auto', minWidth: 0, height: 26, px: 0.75, py: 0, color: COLORS.primary, fontSize: 14 }}
                  >
                    认证
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Tabs
              value={activeTab}
              onChange={(_: SyntheticEvent, value: number) => setActiveTab(value)}
              sx={{
                minHeight: 48,
                px: 2,
                borderBottom: `1px solid ${COLORS.divider}`,
                '& .MuiTab-root': {
                  minHeight: 48,
                  px: 0,
                  minWidth: 84,
                  mr: 4,
                  fontSize: 14,
                  textTransform: 'none',
                },
              }}
            >
              {SETTINGS_TABS.map((tab) => (
                <Tab key={tab} label={tab} />
              ))}
            </Tabs>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', p: 2.5, bgcolor: COLORS.pageBg, display: 'flex', flexDirection: 'column' }}>
              {activeTab === 0 ? (
	                <Stack data-personal-settings-basic-panel spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 0.5 }}>
	                  <Box sx={{ bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, p: 2.5 }}>
	                  <Stack spacing={2.25}>
	                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
	                      <Field
	                        label="姓名"
	                        value={state.displayName}
	                        onChange={(value) => setState((current) => ({ ...current, displayName: value }))}
	                      />
	                      <Box sx={{ flex: 1, minWidth: 0 }}>
	                        <Typography sx={{ mb: 1, fontSize: 14, color: COLORS.textPrimary }}>邮箱</Typography>
	                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 40 }}>
	                          <Button
	                            data-bind-email-button
	                            variant="text"
	                            onClick={handleOpenEmailBindingDialog}
	                            sx={{ minWidth: 0, height: 32, px: 0, color: COLORS.primary, fontSize: 14 }}
	                          >
	                            绑定邮箱账号
	                          </Button>
	                          {state.email ? (
	                            <Typography sx={{ minWidth: 0, flex: 1, fontSize: 14, color: COLORS.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
	                              {state.email}
	                            </Typography>
	                          ) : null}
	                        </Stack>
	                      </Box>
	                    </Stack>
	                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
	                      <Field
	                        label="手机"
	                        value={state.phone}
                        error={phoneError}
                        helperText={phoneError ? '请输入正确的手机' : ''}
                        onChange={(value) => setState((current) => ({ ...current, phone: value }))}
                      />
                    </Stack>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={profileMutation.isPending} sx={{ height: 40, minWidth: 104 }}>
                        保存
	                      </Button>
	                    </Box>
	                  </Stack>
	                  </Box>
	                </Stack>
              ) : (
                <Box sx={{ bgcolor: '#fff', border: `1px solid ${COLORS.divider}`, borderRadius: 1, p: 2.5 }}>
                  <Stack spacing={1.5}>
                    {BINDING_ITEMS.map((bindingKey) => {
                      const value = state.bindings[bindingKey];
                      return (
                        <Box
                          key={bindingKey}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            minHeight: 66,
                            p: 1.5,
                            border: `1px solid ${COLORS.divider}`,
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              bgcolor: COLORS.primaryLight,
                              color: COLORS.primary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '& .MuiSvgIcon-root': { fontSize: 24 },
                            }}
                          >
                            {getBindingIcon(bindingKey)}
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: COLORS.textPrimary }}>{getBindingTitle(bindingKey)}</Typography>
                            <Typography sx={{ mt: 0.5, fontSize: 13, color: COLORS.textSecondary }} noWrap>
                              {getBindingSubtitle(bindingKey, value)}
                            </Typography>
                          </Box>
                          <Button
                            variant="text"
                            onClick={() => handleBindingChange(bindingKey, value ?? '')}
                            sx={{ minWidth: 88, height: 36 }}
                          >
                            更换绑定
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog
        data-avatar-crop-dialog
        open={avatarCropDialogOpen}
        onClose={() => setAvatarCropDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ px: 2.5, py: 1.75, fontSize: 16, fontWeight: 700 }}>头像裁剪</DialogTitle>
        <DialogContent sx={{ px: 2.5, pb: 1, overflowX: 'hidden' }}>
          <Stack spacing={2}>
            <Box
              data-avatar-crop-frame
              onMouseDown={handleCropMouseDown}
              sx={{
                width: AVATAR_CROP_SIZE,
                height: AVATAR_CROP_SIZE,
                mx: 'auto',
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${COLORS.divider}`,
                borderRadius: 1,
                bgcolor: '#fff',
                cursor: cropImageSource ? 'grab' : 'default',
                userSelect: 'none',
              }}
            >
              {cropImageSource && !cropImageLoadFailed ? (
                <Box
                  component="img"
                  data-avatar-crop-image
                  src={cropImageSource}
                  alt="头像裁剪预览"
                  draggable={false}
                  onLoad={handleCropImageLoad}
                  onError={handleCropImageError}
                  sx={{
                    position: 'absolute',
                    left: `calc(50% + ${cropOffset.x}px)`,
                    top: `calc(50% + ${cropOffset.y}px)`,
                    width: cropDisplaySize.width,
                    height: cropDisplaySize.height,
                    display: 'block',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    maxWidth: 'none',
                  }}
                />
              ) : (
                <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: '100%', px: 2, color: COLORS.textDisabled, textAlign: 'center' }}>
                  <PhotoCameraOutlined />
                  <Typography sx={{ fontSize: 14 }}>
                    {cropImageLoadFailed ? '头像图片加载失败，请重新上传' : '请上传头像图片'}
                  </Typography>
                </Stack>
              )}
            </Box>
            <Stack data-avatar-scale-row direction="row" spacing={1.5} alignItems="center" sx={{ overflow: 'hidden' }}>
              <Typography sx={{ width: 36, fontSize: 13, color: COLORS.textSecondary }}>缩放</Typography>
              <Slider
                value={cropScale}
                min={0.5}
                max={3}
                step={0.01}
                disabled={!cropImageSource || cropImageLoadFailed}
                onChange={(_, value) => setCropScale(Array.isArray(value) ? value[0] : value)}
                sx={{ flex: 1, minWidth: 0, mx: 1.5 }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={handleAvatarUploadClick} sx={{ minWidth: 72, height: 32 }}>
            上传
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setAvatarCropDialogOpen(false)} sx={{ minWidth: 72, height: 32 }}>
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleAvatarCropSave}
              disabled={!cropImageSource || cropImageLoadFailed || avatarMutation.isPending || cropSaving}
              sx={{ minWidth: 72, height: 32 }}
            >
              保存
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog
        data-email-binding-dialog
        open={emailBindingDialogOpen}
        onClose={() => setEmailBindingDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ px: 2.5, py: 1.75, fontSize: 16, fontWeight: 700 }}>绑定邮箱账号</DialogTitle>
        <DialogContent sx={{ px: 2.5, pb: 1.5 }}>
          <Field
            label="邮箱"
            value={emailDraft}
            placeholder="请输入邮箱账号"
            error={emailDraftError}
            helperText={emailDraftError ? '请输入正确的邮箱地址' : ''}
            onChange={setEmailDraft}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setEmailBindingDialogOpen(false)} sx={{ minWidth: 72, height: 32 }}>
            取消
          </Button>
          <Button variant="contained" onClick={handleEmailBindingSave} disabled={profileMutation.isPending || emailDraftError} sx={{ minWidth: 72, height: 32 }}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        data-password-change-dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ px: 2.5, py: 1.75, fontSize: 16, fontWeight: 700 }}>修改密码</DialogTitle>
        <DialogContent sx={{ px: 2.5, pb: 1.5 }}>
          <Stack spacing={2}>
            <Field
              label="当前密码"
              type="password"
              value={passwordState.currentPassword}
              onChange={(value) => setPasswordState((current) => ({ ...current, currentPassword: value }))}
            />
            <Field
              label="新密码"
              type="password"
              value={passwordState.newPassword}
              onChange={(value) => setPasswordState((current) => ({ ...current, newPassword: value }))}
            />
            <Field
              label="确认密码"
              type="password"
              value={passwordState.confirmPassword}
              onChange={(value) => setPasswordState((current) => ({ ...current, confirmPassword: value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={handleClosePasswordDialog} disabled={passwordMutation.isPending} sx={{ minWidth: 72, height: 32 }}>
            取消
          </Button>
          <Button
            variant="contained"
            startIcon={<KeyOutlined />}
            onClick={handlePasswordSubmit}
            disabled={passwordMutation.isPending}
            sx={{ minWidth: 96, height: 32 }}
          >
            修改密码
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        data-signature-certification-dialog
        open={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ px: 2.5, py: 1.75, fontSize: 16, fontWeight: 700 }}>电子签名认证</DialogTitle>
        <DialogContent sx={{ px: 2.5, pb: 1.5 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.3fr) minmax(260px, 0.7fr)' }, gap: 2 }}>
              <Box data-signature-pad sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: 14, color: COLORS.textPrimary }}>手写签名板</Typography>
                  <Button variant="text" onClick={handleClearSignaturePad} sx={{ minWidth: 44, height: 28 }}>
                    清空
                  </Button>
                </Stack>
                <Box
                  component="canvas"
                  data-signature-canvas
                  ref={signatureCanvasRef}
                  width={SIGNATURE_PAD_WIDTH}
                  height={SIGNATURE_PAD_HEIGHT}
                  onPointerDown={handleSignaturePointerDown}
                  onPointerMove={handleSignaturePointerMove}
                  onPointerUp={handleSignaturePointerEnd}
                  onPointerCancel={handleSignaturePointerEnd}
                  sx={{
                    width: '100%',
                    height: 180,
                    display: 'block',
                    border: `1px dashed ${COLORS.divider}`,
                    borderRadius: 1,
                    bgcolor: '#fff',
                    touchAction: 'none',
                    cursor: 'crosshair',
                  }}
                />
              </Box>
              <Stack spacing={2}>
                <EvidenceUploadBox
                  label="身份证正面"
                  file={signatureState.idCardFrontFile}
                  placeholder="请上传身份证正面"
                  onChange={(event) => handleSignatureEvidenceChange('front', event)}
                />
                <EvidenceUploadBox
                  label="身份证反面"
                  file={signatureState.idCardBackFile}
                  placeholder="请上传身份证反面"
                  onChange={(event) => handleSignatureEvidenceChange('back', event)}
                />
              </Stack>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Field
                label="签名含义"
                value={signatureState.meaning}
                onChange={(value) => setSignatureState((current) => ({ ...current, meaning: value }))}
              />
              <Field
                label="认证密码"
                type="password"
                value={signatureState.password}
                onChange={(value) => setSignatureState((current) => ({ ...current, password: value }))}
              />
            </Stack>

            <Stack spacing={1}>
              {signatureStatements.map((statement, index) => (
                <Box
                  key={statement.key}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    p: 1.25,
                    border: `1px solid ${COLORS.divider}`,
                    borderRadius: 1,
                    bgcolor: signatureState.confirmations[statement.key] ? COLORS.primaryLight : '#fff',
                  }}
                >
                  <Checkbox
                    checked={signatureState.confirmations[statement.key]}
                    onChange={(event) => handleSignatureConfirmationChange(statement.key, event.target.checked)}
                    sx={{ p: 0.25 }}
                  />
                  <Typography sx={{ fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.7 }}>
                    {index + 1}、{statement.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setSignatureDialogOpen(false)} sx={{ minWidth: 72, height: 32 }}>
            取消
          </Button>
          <Button
            variant="contained"
            startIcon={<KeyOutlined />}
            onClick={handleSignatureSubmit}
            disabled={!canSubmitSignature || signatureMutation.isPending}
            sx={{ minWidth: 96, height: 32 }}
          >
            认证
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box sx={{ width: 22, color: COLORS.textDisabled, display: 'flex', justifyContent: 'center', '& .MuiSvgIcon-root': { fontSize: 18 } }}>{icon}</Box>
      <Typography sx={{ minWidth: 48, fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.5 }}>{label}</Typography>
      <Typography sx={{ minWidth: 0, flex: 1, fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.5, wordBreak: 'break-all' }}>{value}</Typography>
    </Stack>
  );
}

function EvidenceUploadBox({
  label,
  file,
  placeholder,
  onChange,
}: {
  label: string;
  file: File | null;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Box>
      <Typography sx={{ mb: 1, fontSize: 14, color: COLORS.textPrimary }}>{label}</Typography>
      <Button
        component="label"
        variant="outlined"
        startIcon={<FileUploadOutlined />}
        sx={{
          width: '100%',
          minHeight: 64,
          justifyContent: 'flex-start',
          borderStyle: 'dashed',
          color: file ? COLORS.textPrimary : COLORS.textSecondary,
          textAlign: 'left',
          '& .MuiButton-startIcon': { color: COLORS.primary },
        }}
      >
        <Typography component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>
          {file?.name || placeholder}
        </Typography>
        <Box component="input" hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={onChange} />
      </Button>
    </Box>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  disabled = false,
  error = false,
  helperText = '',
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ mb: 1, fontSize: 14, color: COLORS.textPrimary }}>{label}</Typography>
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        fullWidth
        multiline={multiline}
        minRows={multiline ? 3 : undefined}
        disabled={disabled}
        error={error}
        helperText={helperText}
        InputLabelProps={type === 'date' ? { shrink: true } : undefined}
        sx={{
          '& .MuiInputBase-root': {
            minHeight: multiline ? 92 : 40,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        }}
      />
    </Box>
  );
}
