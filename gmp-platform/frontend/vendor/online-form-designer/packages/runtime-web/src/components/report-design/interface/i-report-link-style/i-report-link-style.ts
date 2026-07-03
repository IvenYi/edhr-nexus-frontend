import { TextDecoration } from "@gct/runtime";

/**
 * 链接样式配置
 *
 * @export
 * @interface IReportLinkStyle
 */
export interface IReportLinkStyle {
  /**
   * 文字颜色
   *
   * @type {string}
   */
  color: string;
  /**
   * 是否使用主题色
   *
   * @type {0 | 1}
   */
  theme: 0 | 1;
  /**
   * 文字是否加粗
   *
   * @type {boolean}
   */
  bold: boolean;
  /**
   * 文字是否斜体
   *
   * @type {boolean}
   */
  italic: boolean;
  /**
   * 文字修饰
   *
   * @type {boolean}
   */
  underline: boolean;
}
