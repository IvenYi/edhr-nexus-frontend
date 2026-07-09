/**
 * 表格项编辑器配置接口
 *
 * @export
 * @interface IVTableColumnEditor
 */
export interface IVTableColumnEditor {
  /**
   * 编辑器类型
   *
   * @type {string}
   */
  type: string;

  /**
   * 编辑器配置项
   *
   * @type {IObject}
   */
  options?: IObject;
}
