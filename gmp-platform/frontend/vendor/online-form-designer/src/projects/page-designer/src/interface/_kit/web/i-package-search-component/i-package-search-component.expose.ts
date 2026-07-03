/**
 * 包装查询组件
 * @interface IPackageSearchComponentExpose
 */

export interface IPackageSearchComponentExpose {
  /**
   * 包装锁定状态
   */
  lockStatus: boolean;

  /**
   * 获取查询表单数据
   * @return {IObject} 
   */
  getValue(): IObject;

  /**
   * 锁定方法
   * @async
   * @function handleLock
   * @return {Promise<void>}
   */
  handleLock(): Promise<void>;

  /**
   * 锁定方法
   * @async
   * @function handleUnlock
   * @return {Promise<void>}
   */
  handleUnlock(): Promise<void>;

  /**
   * 重置清空
   * @async
   * @return {Promise<void>}
   */
  reset(): Promise<void>;
}