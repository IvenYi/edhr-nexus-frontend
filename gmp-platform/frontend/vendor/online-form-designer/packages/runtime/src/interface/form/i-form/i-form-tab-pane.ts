import { IFormContainer } from './i-form-container';

/**
 * 表单分页容器
 * @author lingxiaoming
 * @date 2024-07-14 01:38:20
 * @export
 * @interface IFormTab
 * @extends {IFormContainer}
 */
export interface IFormTabPane extends IFormContainer {
  type: 'tab-pane';

  /**
   * 是否是容器
   */
  isContainer: true;

  /**
   * 分页标题
   * @author lingxiaoming
   * @date 2024-07-14 01:43:06
   * @type {string}
   */
  title: string;
}
