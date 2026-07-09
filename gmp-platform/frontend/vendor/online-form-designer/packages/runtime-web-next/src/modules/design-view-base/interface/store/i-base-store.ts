import { Ref } from 'vue';

/**
 * 设计界面基础状态管理接口
 *
 * @export
 * @interface IBaseStore
 */
export interface IBaseStore {
  /**
   * 是否需要脏检查，默认不需要
   *
   * @type {Ref<boolean>}
   */
  dirtyCheck: Ref<boolean>;

  /**
   * 设置脏检查状态
   */
  enableDirtyCheck(): void;

  /**
   * 关闭脏检查状态
   */
  disableDirtyCheck(): void;
}
