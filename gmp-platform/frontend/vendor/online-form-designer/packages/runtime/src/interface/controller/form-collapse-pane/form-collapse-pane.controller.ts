import { IFormCollapsePane } from '../../form';
import { IFormCollapsePaneState } from '../../state';
import { IFormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单折叠面板项
 * @author lingxiaoming
 * @date 2024-07-14 01:53:49
 * @export
 * @interface IFormCollapsePaneController
 * @extends {IFormItemBasicController<M, S>}
 * @template M
 * @template S
 */
export interface IFormCollapsePaneController<
  M extends IFormCollapsePane = IFormCollapsePane,
  S extends IFormCollapsePaneState = IFormCollapsePaneState,
> extends IFormItemBasicController<M, S> {
  /**
   * 折叠面板项类型
   *
   * @author lingxiaoming
   * @date 2024-07-14 01:56:56
   * @type {'collapse-pane'}
   */
  type: 'collapse-pane';
}
