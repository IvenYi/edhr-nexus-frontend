import { IFormCollapsePane } from './i-form-collapse-pane';
import { IFormContainer } from './i-form-container';

/**
 * 表单折叠面板
 * @author lingxiaoming
 * @date 2024-07-14 01:38:20
 * @export
 * @interface IFormCollapse
 * @extends {IFormContainer}
 */
export interface IFormCollapse extends IFormContainer {
  type: 'collapse';

  /**
   * 是否是容器
   */
  isContainer: true;

  /**
   * 手风琴模式(开启后同时只能展开一个面板)
   * @author lingxiaoming
   * @date 2024-07-15 11:00:57
   * @type {boolean}
   */
  accordion?: boolean;

  /**
   * 折叠图标位置
   * @author lingxiaoming
   * @date 2024-07-15 11:28:29
   * @type {('left' | 'right')}
   */
  expandIconPosition?: 'left' | 'right';

  /**
   * 折叠图标呈现样式(第一个是展开的状态,第二个是折叠的状态)
   * @author lingxiaoming
   * @date 2024-07-15 02:50:01
   * @type {('down-right' | 'up-down')}
   */
  expandIconStyle?: 'down-right' | 'up-down';

  children?: IFormCollapsePane[];
}
