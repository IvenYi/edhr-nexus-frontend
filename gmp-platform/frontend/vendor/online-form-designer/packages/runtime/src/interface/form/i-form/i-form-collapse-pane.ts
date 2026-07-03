import { IFormContainer } from './i-form-container';

/**
 * 表单折叠面板项
 * @author lingxiaoming
 * @date 2024-07-14 01:38:20
 * @export
 * @interface IFormCollapsePane
 * @extends {IFormContainer}
 */
export interface IFormCollapsePane extends IFormContainer {
  type: 'collapse-pane';

  /**
   * 是否是容器
   */
  isContainer: true;

  /**
   * 面板头部标题
   * @author lingxiaoming
   * @date 2024-07-15 11:02:21
   * @type {string}
   */
  title: string;

  /**
   * 是否可以折叠(默认可折叠)
   * @author lingxiaoming
   * @date 2024-07-15 11:02:37
   * @type {boolean}
   */
  collapsible?: boolean;
}
