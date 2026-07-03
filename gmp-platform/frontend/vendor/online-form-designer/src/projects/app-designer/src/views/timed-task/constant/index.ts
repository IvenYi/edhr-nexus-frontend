/**
 * 定时任务行为
 *
 * @author chitanda
 * @date 2024-03-19 16:03:18
 * @export
 * @enum {number}
 */
export enum TimedTaskAction {
  /**
   * 编辑
   */
  EDIT = 'edit',
  /**
   * 新建
   */
  ADD = 'add',
  /**
   * 保存
   */
  SAVE = 'save',
  /**
   * 删除
   */
  DELETE = 'delete',
  /**
   * 启用
   */
  ENABLE = 'enable',
  /**
   * 禁用
   */
  DISABLE = 'disable',
  /**
   * 手动执行
   */
  MANUAL_EXECUTION = 'manualExecution',
}
