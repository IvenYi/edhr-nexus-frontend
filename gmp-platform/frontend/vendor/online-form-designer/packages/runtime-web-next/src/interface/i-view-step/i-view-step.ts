/**
 * 设计视图步骤接口
 *
 * @export
 * @interface IViewStep
 */
export interface IViewStep {
  /**
   * 步骤标识符
   *
   * @type {string}
   */
  tag: string;
  /**
   * 步骤名称
   *
   * @type {string}
   */
  name: string;
  /**
   * 步骤图标（只支持 svg）
   *
   * @type {string}
   */
  icon?: string;
  /**
   * 步骤描述
   *
   * @type {string}
   */
  description?: string;
}
