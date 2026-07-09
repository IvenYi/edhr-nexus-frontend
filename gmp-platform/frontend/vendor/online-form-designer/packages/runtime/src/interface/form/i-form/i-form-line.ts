import { IFormContainer } from './i-form-container';

/**
 * 表单分组容器
 *
 * @export
 * @interface IFormLine
 * @extends {IFormContainer}
 */
export interface IFormLine extends IFormContainer {
  /**
   * 分割线上间距
   *
   * @default 8px
   * @type {string}
   */
  paddingTop?: string;
  /**
   * 分割线下间距
   *
   * @default 8px
   * @type {string}
   */
  paddingBottom?: string;
}
