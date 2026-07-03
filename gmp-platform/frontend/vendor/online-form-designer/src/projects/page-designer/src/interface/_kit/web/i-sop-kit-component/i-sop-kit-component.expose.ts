/**
 * SOP组件
 * @interface ISOPComponentExpose
 */

export interface ISOPComponentExpose {
  /**
   * 获取sop数据
   * @return {Array<object>}
   */
  getValue(): Array<object>;

  /**
   * SOP数据重载
   * @async
   * @return {Promise}
   */
  reload(): Promise<void>;

  /**
   * 重置sop数据
   */
  reset(): void;
}