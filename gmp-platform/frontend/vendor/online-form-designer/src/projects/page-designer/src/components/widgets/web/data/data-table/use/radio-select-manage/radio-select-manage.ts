import { inject, provide } from "vue";

export interface IRadioSelectManager {
  /**
   * 注册表格清空方法
   *
   * @author chitanda
   * @date 2025-10-10 17:10:09
   * @param {string} key
   * @param {() => void} fn
   */
  setRegisterTableClear(key: string, fn: () => void): void;
  /**
   * 清空除当前表格外所有表格的选中
   *
   * @author chitanda
   * @date 2025-10-10 17:10:51
   * @param {string} keyTag
   */
  clearRadioSelect(keyTag: string): void;
  /**
   * 删除注册，需要在组件销毁时调用
   *
   * @author chitanda
   * @date 2025-10-10 17:10:28
   * @param {string} keyTag
   */
  removeRegisterTableClear(keyTag: string): void;
}

/**
 * 嵌套表格的单选模式下，选中数据时清空其他表格选中
 *
 * @author chitanda
 * @date 2025-10-10 16:10:43
 * @export
 * @returns {*}
 */
export function useRadioSelectManage(): IRadioSelectManager {
  // 所有表格注册的清空方法
  const registerTableClear: Map<string, () => void> = new Map();

  /**
   * 注册表格清空方法
   *
   * @author chitanda
   * @date 2025-10-10 16:10:27
   * @param {() => void} fn
   */
  const setRegisterTableClear = (key: string, fn: () => void) => {
    registerTableClear.set(key, fn);
  };

  /**
   * 清空时传入表格唯一标识，避免清空自己
   *
   * @author chitanda
   * @date 2025-10-10 16:10:45
   * @param {string} keyTag
   */
  const clearRadioSelect = (keyTag: string) => {
    registerTableClear.forEach((fn, key) => {
      if (key !== keyTag) {
        fn();
      }
    });
  };

  /**
   * 删除注册，需要在组件销毁时调用
   *
   * @author chitanda
   * @date 2025-10-10 17:10:05
   */
  function removeRegisterTableClear(keyTag: string): void {
    registerTableClear.delete(keyTag);
  }

  return {
    setRegisterTableClear,
    clearRadioSelect,
    removeRegisterTableClear,
  };
}

/**
 * 创建单选管理器，同一个作用域下的表格公用一个管理器
 *
 * @author chitanda
 * @date 2025-10-10 17:10:14
 * @export
 * @param {string} sessionId
 * @returns {*}
 */
export function createRadioSelectManager(sessionId: string) {
  const key = `radio_select_manage_${sessionId}`;
  let manage: IRadioSelectManager = inject(key) as IRadioSelectManager;
  if (!manage) {
    manage = useRadioSelectManage();
    provide(key, manage);
  }
  return manage;
}
