import { ref } from 'vue';
import { IBaseStore } from '../interface';

/**
 * 设计界面基础状态管理
 *
 * @export
 * @returns {*}
 */
export function useBaseStore(): IBaseStore {
  /**
   * 是否需要脏检查，默认不需要
   *
   * @type {boolean}
   */
  const dirtyCheck = ref(false);
  /**
   * 设置脏检查状态
   *
   * @param {boolean} value
   * @returns {void}
   */
  function enableDirtyCheck(): void {
    dirtyCheck.value = true;
  }
  /**
   * 关闭脏检查状态
   *
   */
  function disableDirtyCheck(): void {
    dirtyCheck.value = false;
  }

  return {
    dirtyCheck,
    enableDirtyCheck,
    disableDirtyCheck,
  };
}
