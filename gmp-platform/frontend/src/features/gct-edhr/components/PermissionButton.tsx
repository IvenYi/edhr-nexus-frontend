import type { ReactElement } from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import {
  Add,
  AddBox,
  Assessment,
  CallSplit,
  CheckCircle,
  Close,
  ContentCopy,
  Dataset,
  Delete,
  DeleteOutline,
  DesignServices,
  Done,
  Download,
  DriveFileMove,
  Edit,
  FileDownload,
  FileUpload,
  Forward,
  LockReset,
  MoreHoriz,
  PlayArrow,
  PlaylistAdd,
  Print,
  Publish,
  RestartAlt,
  RocketLaunch,
  Rule,
  Save,
  Search,
  Settings,
  Summarize,
  SwapHoriz,
  Undo,
  Unpublished,
  Visibility,
} from '@mui/icons-material';
import type { EdhrActionMeta } from '../types';
import { getActionLabel, getActionPolicy } from '../utils/actionPolicy';

type ButtonColor = NonNullable<ButtonProps['color']>;

interface PermissionButtonProps {
  action: Pick<EdhrActionMeta, 'code' | 'label' | 'permissionRequired' | 'auditRequired'>;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
  size?: 'small' | 'medium';
}

const iconByAction: Record<string, ReactElement> = {
  query: <Search fontSize="small" />,
  reset: <RestartAlt fontSize="small" />,
  create: <Add fontSize="small" />,
  add: <Add fontSize="small" />,
  edit: <Edit fontSize="small" />,
  detail: <Visibility fontSize="small" />,
  view: <Visibility fontSize="small" />,
  delete: <Delete fontSize="small" />,
  disable: <Unpublished fontSize="small" />,
  enable: <Publish fontSize="small" />,
  copy: <ContentCopy fontSize="small" />,
  version_create: <PlaylistAdd fontSize="small" />,
  version_copy: <ContentCopy fontSize="small" />,
  process: <PlayArrow fontSize="small" />,
  finish: <Done fontSize="small" />,
  approve: <CheckCircle fontSize="small" />,
  reject: <Close fontSize="small" />,
  release: <RocketLaunch fontSize="small" />,
  withdraw: <Undo fontSize="small" />,
  transfer: <SwapHoriz fontSize="small" />,
  reset_password: <LockReset fontSize="small" />,
  print: <Print fontSize="small" />,
  download: <Download fontSize="small" />,
  export: <FileDownload fontSize="small" />,
  import: <FileUpload fontSize="small" />,
  publish: <Publish fontSize="small" />,
  unpublish: <Unpublished fontSize="small" />,
  save: <Save fontSize="small" />,
  configure: <Settings fontSize="small" />,
  design: <DesignServices fontSize="small" />,
  split: <CallSplit fontSize="small" />,
  dhr: <Rule fontSize="small" />,
  summarize: <Summarize fontSize="small" />,
  move: <DriveFileMove fontSize="small" />,
  delete_file: <DeleteOutline fontSize="small" />,
  create_dataset: <Dataset fontSize="small" />,
  create_report: <Assessment fontSize="small" />,
  batch_download: <Download fontSize="small" />,
  execution_detail: <Visibility fontSize="small" />,
  fill: <Edit fontSize="small" />,
  inspect: <Rule fontSize="small" />,
  forward: <Forward fontSize="small" />,
  add_field: <AddBox fontSize="small" />,
};

const dangerActions = new Set(['delete', 'delete_file', 'reject', 'disable']);
const successActions = new Set(['approve', 'release', 'finish', 'enable', 'publish']);
const warningActions = new Set(['withdraw', 'transfer', 'reset_password', 'unpublish']);
const infoActions = new Set(['query', 'detail', 'view', 'download', 'export', 'print', 'batch_download']);

export default function PermissionButton({
  action,
  onClick,
  disabled = false,
  compact = false,
  size = 'small',
}: PermissionButtonProps) {
  const policy = getActionPolicy(action.code);
  const label = getActionLabel(action.code, action as EdhrActionMeta);
  const icon = iconByAction[action.code] ?? <MoreHoriz fontSize="small" />;
  const color = getButtonColor(action.code);
  const tooltip = `${label}${action.permissionRequired ? ' · 需权限' : ''}${policy.auditRequired || action.auditRequired ? ' · 留痕' : ''}`;

  if (compact) {
    return (
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton size={size} color={color} disabled={disabled} onClick={onClick} aria-label={label}>
            {icon}
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip} arrow>
      <span>
        <Button
          size={size}
          color={color}
          variant={color === 'error' ? 'outlined' : 'contained'}
          startIcon={icon}
          disabled={disabled}
          onClick={onClick}
          sx={{ minWidth: 0, whiteSpace: 'nowrap' }}
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );
}

function getButtonColor(actionCode: string): ButtonColor {
  if (dangerActions.has(actionCode)) return 'error';
  if (successActions.has(actionCode)) return 'success';
  if (warningActions.has(actionCode)) return 'warning';
  if (infoActions.has(actionCode)) return 'info';
  return 'primary';
}
