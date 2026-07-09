import { IFormItemBasicState } from '../form-item-basic/form-item-basic.state';

/**
 * 表单分页状态
 *
 * @author lingxiaoming
 * @date 2024-07-14 01:54:34
 * @export
 * @interface IFormTabState
 * @extends {IFormItemBasicState}
 */
export interface IFormTabState extends IFormItemBasicState {
  /**
   * 当前显示的分页面板的名称
   * @author lingxiaoming
   * @date 2024-07-14 01:55:46
   * @type {string}
   */
  activePane: string;
}
