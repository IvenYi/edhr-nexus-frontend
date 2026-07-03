/**
 * 应用全局设置接口
 *
 * @author chitanda
 * @date 2025-07-22 19:07:29
 * @export
 * @interface IAppSetting
 */
export interface IAppSetting {
  /**
   * 分支标识
   *
   * @author chitanda
   * @date 2025-07-22 20:07:59
   * @type {string}
   */
  branchId: string;
  /**
   * 应用环境
   *
   * @author chitanda
   * @date 2025-07-22 19:07:47
   * @type {string}
   */
  env: string;
  /**
   * 空值显示
   *
   * @default '--'
   * @author chitanda
   * @date 2025-07-22 19:07:24
   * @type {string}
   */
  emptyDisplay: string;
}
