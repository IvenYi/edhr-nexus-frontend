import { BasicAction } from '/@/enums/authActionEnum';
import { DhrPermissionEnum } from '/@/perms/index';

/**
 * 审核操作
 */
export enum ApproveControlAction {
  /** 审核生效 */
  APPROVE = 'APPROVE',
  /** 生效 */
  EFFECT = 'EFFECT',
  /** 审核路径 */
  APPROVE_PATH = 'APPROVE_PATH',
  /** 撤回 */
  WITHDRAW = 'WITHDRAW',
  /** 流程设计 */
  PROCESS_DESIGN = 'process_design',
  /** 按钮设计 */
  BUTTON_DESIGN = 'button_design',
}

export const ApproveControlActionMap = {
  [ApproveControlAction.APPROVE]: {
    authAction: [BasicAction.Update, DhrPermissionEnum.Controller],
    label: $t('sys.edhr.approve'),
  },
  [ApproveControlAction.APPROVE_PATH]: {
    label: $t('sys.edhr.controlPath'),
  },
  [ApproveControlAction.EFFECT]: {
    authAction: [DhrPermissionEnum.Effect, DhrPermissionEnum.Effect],
    label: $t('sys.edhr.effect'),
  },
  [ApproveControlAction.WITHDRAW]: {
    authAction: [BasicAction.Update, DhrPermissionEnum.Withdraw],
    label: $t('sys.edhr.withdraw'),
  },
  [ApproveControlAction.PROCESS_DESIGN]: {
    authAction: [BasicAction.Design, DhrPermissionEnum.ProcessDesign],
    label: $t('sys.webRender.processDesign'),
  },
  [ApproveControlAction.BUTTON_DESIGN]: {
    authAction: [BasicAction.Design, DhrPermissionEnum.ButtonsDesign],
    label: $t('sys.webRender.buttonDesign'),
  },
} as const;
