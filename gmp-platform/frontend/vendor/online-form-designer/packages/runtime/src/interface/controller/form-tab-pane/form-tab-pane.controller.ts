import { IFormTabPane } from '../../form';
import { IFormTabPaneState } from '../../state';
import { IFormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单分页
 * @author lingxiaoming
 * @date 2024-07-14 01:53:49
 * @export
 * @interface IFormTabPaneController
 * @extends {IFormItemBasicController<M, S>}
 * @template M
 * @template S
 */
export interface IFormTabPaneController<
  M extends IFormTabPane = IFormTabPane,
  S extends IFormTabPaneState = IFormTabPaneState,
> extends IFormItemBasicController<M, S> {
  /**
   * 分页pane类型
   *
   * @author lingxiaoming
   * @date 2024-07-14 01:56:56
   * @type {'tab-pane'}
   */
  type: 'tab-pane';
}
