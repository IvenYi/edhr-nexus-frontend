import { mitt } from '/@/utils/mitt';

const emitter = mitt();

export enum EmitterEnum {
  /** 刷新组织树信息 */
  on_refresh_tree_list = 'on-refresh-tree-list',
}

export function useEmitter() {
  return {
    emitter,
    EmitterEnum,
  };
}
