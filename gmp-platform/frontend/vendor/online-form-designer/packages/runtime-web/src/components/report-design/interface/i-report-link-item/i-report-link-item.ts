import { REPORT_LINK_OPEN_MODE, REPORT_LINK_TYPE } from "../../constants";

/**
 * 报表跳转项
 *
 * @export
 * @interface IReportLinkItem
 */
export interface IReportLinkItem {
  /**
   * 项唯一标识，用于选中等
   *
   * @type {string}
   */
  id: string;
  /**
   * 跳转类型
   *
   * @type {REPORT_LINK_TYPE}
   */
  type: REPORT_LINK_TYPE;
  /**
   * 打开方式
   *
   * @type {REPORT_LINK_OPEN_MODE}
   */
  openMode: REPORT_LINK_OPEN_MODE;
  /**
   * 字段与 schema 中的 filedMap 对应
   *
   * @type {string}
   */
  field?: string;
  /**
   * 报表 id，跳转类型为 REPORT_LINK_TYPE.REPORT 时必填
   *
   * @type {string}
   */
  report?: string;
  reportName?: string;
  /**
   * 链接地址，跳转类型为 REPORT_LINK_TYPE.LINK 时必填
   *
   * @type {string}
   */
  url?: string;
}
