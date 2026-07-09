import { mitt } from '/@/utils/mitt';

const emitter = mitt();

export enum EmitterEnum {
  /** 打开编辑用户组弹框 */
  on_edit_user_group = 'on-edit-user-group',
  on_refresh_detail = 'on-refresh-detail',
  on_delete_user_group = 'on-delete-user-group',
}

export function useEmitter() {
  return {
    emitter,
    EmitterEnum,
  };
}
