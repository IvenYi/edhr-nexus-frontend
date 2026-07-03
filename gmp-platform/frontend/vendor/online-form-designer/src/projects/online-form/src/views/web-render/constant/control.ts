import { BasicAction } from '/@/enums/authActionEnum';
import { DhrPermissionEnum } from '/@/perms/index';

/**
 * 受控操作
 */
export enum ControlAction {
  /** 受控 */
  CONTROL = 'CONTROL',
  /** 受控路径 */
  CONTROL_PATH = 'CONTROL_PATH',
  /** 撤回 */
  WITHDRAW = 'WITHDRAW',
  /** 流程设计 */
  PROCESS_DESIGN = 'process_design',
  /** 按钮设计 */
  BUTTON_DESIGN = 'button_design',
}

export const ControlActionMap = {
  [ControlAction.CONTROL]: {
    authAction: [BasicAction.Update, DhrPermissionEnum.Controller],
    label: $t('sys.edhr.control'),
  },
  [ControlAction.CONTROL_PATH]: {
    label: $t('sys.edhr.controlPath'),
  },
  [ControlAction.WITHDRAW]: {
    authAction: [BasicAction.Update, DhrPermissionEnum.Withdraw],
    label: $t('sys.edhr.withdraw'),
  },
  [ControlAction.PROCESS_DESIGN]: {
    authAction: [BasicAction.Design, DhrPermissionEnum.ProcessDesign],
    label: $t('sys.webRender.processDesign'),
  },
  [ControlAction.BUTTON_DESIGN]: {
    authAction: [BasicAction.Design, DhrPermissionEnum.ButtonsDesign],
    label: $t('sys.webRender.buttonDesign'),
  },
} as const;
