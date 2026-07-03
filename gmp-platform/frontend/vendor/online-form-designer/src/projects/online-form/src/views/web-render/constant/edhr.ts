import { BasicAction } from '/@/enums/authActionEnum';
import { ControlAction, ControlActionMap } from './control';
import { ApproveControlAction, ApproveControlActionMap } from './approveControl';
import { DhrPermissionEnum } from '/@/perms/index';
import { isEnableApproveControl } from '../hooks/useApproveControl';

/**
 * edhr版本的操作
 */
export enum EdhrVersionAction {
  /** 创建版本 */
  CREATE_VERSION = 'create_version',
  /** 编辑版本 */
  EDIT_VERSION = 'edit_version',
  /** 复制版本 */
  COPY_VERSION = 'copy_version',
  /** 删除版本 */
  DELETE_VERSION = 'delete_version',
  /** 设计版本 */
  DESIGN_VERSION = 'design_version',
  /** 复制edhr，携带默认版本 */
  COPY_EDHR = 'copy_form',
  /** 复制edhr，携带指定版本 */
  COPY_EDHR_WITH_VERSION = 'copy_form_with_version',
  /** 设置默认版本 */
  SET_DEFAULT_VERSION = 'set_default_version',
  /** 建模追溯 */
  MODELING_TRACEABILITY = 'modelingTraceability',
}

export const EdhrVersionActionMap = {
  [EdhrVersionAction.CREATE_VERSION]: {
    authAction: [BasicAction.Insert, DhrPermissionEnum.InsertVer],
    label: $t('sys.pageDesigner.version_createText'),
  },
  [EdhrVersionAction.EDIT_VERSION]: {
    authAction: [BasicAction.Update, DhrPermissionEnum.UpdateVer],
    label: $t('sys.edit'),
  },
  [EdhrVersionAction.COPY_VERSION]: {
    authAction: [BasicAction.Insert, DhrPermissionEnum.CopyVer],
    label: $t('sys.pageDesigner.version_copyText'),
  },
  [EdhrVersionAction.DELETE_VERSION]: {
    authAction: [BasicAction.Delete, DhrPermissionEnum.DeleteVer],
    label: $t('sys.delete'),
  },
  [EdhrVersionAction.DESIGN_VERSION]: {
    authAction: [BasicAction.Design, DhrPermissionEnum.Design],
    label: $t('sys.design'),
  },
  [EdhrVersionAction.COPY_EDHR]: {
    authAction: [BasicAction.Insert, DhrPermissionEnum.CopyDefaultVer],
    label: $t('sys.copy'),
  },
  // [EdhrVersionAction.COPY_EDHR_WITH_VERSION]: {
  //   authAction: [BasicAction.Insert, DhrPermissionEnum.CopyCurrentVer],
  //   label: $t('sys.copy'),
  // },
  [EdhrVersionAction.SET_DEFAULT_VERSION]: {
    authAction: [BasicAction.Update, DhrPermissionEnum.UpdateVer],
    label: $t('sys.setDefault'),
  },
  [EdhrVersionAction.MODELING_TRACEABILITY]: {
    label: $t('sys.appDesigner.modelTrace'),
  },
  ...ControlActionMap,
  ...ApproveControlActionMap,
};

/** edhr版本父的操作 */
export const EdhrVersionParentActions = [
  EdhrVersionAction.COPY_EDHR,
  EdhrVersionAction.CREATE_VERSION,
];

// 文控操作 will @deprecated!!!
export const ControlActions = [
  ControlAction.CONTROL,
  ControlAction.CONTROL_PATH,
  ControlAction.WITHDRAW,
];

// @Progressives [迭代3.0.5]eDHR审核功能替代之前的文控，medPro可渐进式选择替换
export const ApproveControlActions = [
  ApproveControlAction.APPROVE,
  ApproveControlAction.APPROVE_PATH,
  ApproveControlAction.EFFECT,
  ApproveControlAction.WITHDRAW,
];

const ControlActionEntries = isEnableApproveControl()
  ? [...ApproveControlActions]
  : [...ControlActions];

/** edhr版本的操作 */
export const EdhrVersionActions = [
  EdhrVersionAction.DESIGN_VERSION,
  EdhrVersionAction.COPY_VERSION,
  EdhrVersionAction.DELETE_VERSION,
  EdhrVersionAction.EDIT_VERSION,
  EdhrVersionAction.MODELING_TRACEABILITY,
  // EdhrVersionAction.COPY_EDHR_WITH_VERSION,
  EdhrVersionAction.SET_DEFAULT_VERSION,
  // 审核（文控）
  ...ControlActionEntries,
];
