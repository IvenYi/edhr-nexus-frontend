/**
 * @interface IWorkflowStepComponentExpose
 */

export interface IWorkflowStepComponentExpose {
  /**
   * 获取工步组件关联的字段值
   * @return {*}  {string}
   */
  getValue(): string;

  /**
   * 设置工步组件关联的字段值
   * @param {string} value
   */
  setValue(value: string): void;
}
