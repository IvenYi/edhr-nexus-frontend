import { mitt } from '/@/utils/mitt';

const emitter = mitt();

export enum EmitterEnum {
  /** 打开编辑应用弹框 */
  on_edit_app = 'on-edit-app',
  /** 刷新应用详情信息 */
  on_refresh_app_detail = 'on-refresh-app-edit',
  /** 刷新应用列表 */
  on_refresh_app_list = 'on-refresh-app-list',
  /** 列表分页刷新 */
  on_change_pagination = 'on-change-pagination',
}

export function useEmitter() {
  return {
    emitter,
    EmitterEnum,
  };
}
