import { IFormContainer } from './i-form-container';
import { IFormTabPane } from './i-form-tab-pane';

/**
 * 表单分页容器
 * @author lingxiaoming
 * @date 2024-07-14 01:38:20
 * @export
 * @interface IFormTab
 * @extends {IFormContainer}
 */
export interface IFormTab extends IFormContainer {
  type: 'tab';
  /**
   * 是否是容器
   */
  isContainer: true;
  children?: IFormTabPane[];

  /**
   * 导航位置
   * @author lingxiaoming
   * @date 2024-07-15 01:19:44
   * @type {('center' | 'left' | 'right')}
   */
  navPosition?: 'center' | 'left' | 'right';
}
