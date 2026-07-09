import { IFormTab } from '../../form';
import { IFormTabState } from '../../state';
import { IFormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单分页
 * @author lingxiaoming
 * @date 2024-07-14 01:53:49
 * @export
 * @interface IFormTabController
 * @extends {IFormItemBasicController<M, S>}
 * @template M
 * @template S
 */
export interface IFormTabController<
  M extends IFormTab = IFormTab,
  S extends IFormTabState = IFormTabState,
> extends IFormItemBasicController<M, S> {
  /**
   * 分页类型
   *
   * @author lingxiaoming
   * @date 2024-07-14 01:56:56
   * @type {'tab'}
   */
  type: 'tab';
}
