/**
 * 报表配置（对接后台对象）
 *
 * @export
 * @interface IReportConfig
 */
export interface IReportConfig {
  /**
   * 数据标识
   *
   * @type {string}
   */
  id: string;
  /**
   * 报表key
   *
   * @type {string}
   */
  key: string;
  /**
   * 报表名称
   *
   * @type {string}
   */
  name: string;
  /**
   * 报表类型（目前只支持表格）
   *
   * @type {string}
   */
  reportType: string;
  /**
   * 报表分类id
   *
   * @type {string}
   */
  categoryId: string;
  /**
   * 报表分类名称
   *
   * @type {string}
   */
  categoryName: string;
  /**
   * 设计态 json
   *
   * @type {string}
   */
  designerJson?: string;
  /**
   * 运行时 json
   *
   * @type {string}
   */
  runtimeJson?: string;
  /**
   * 是否发布
   *
   * @type {number}
   */
  publish?: number;
  /**
   * 截图
   *
   * @type {number}
   */
  screenShoot?: string;
  /**
   * 模型表示
   *
   * @type {string}
   */
  modelKey?: string;
  /**
   * 模型类型
   *
   * @type {string}
   */
  modelType?: string;
}
