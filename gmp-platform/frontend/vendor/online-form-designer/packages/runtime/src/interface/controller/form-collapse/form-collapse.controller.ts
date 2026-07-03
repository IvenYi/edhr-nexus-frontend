import { IFormCollapse } from '../../form';
import { IFormCollapseState } from '../../state';
import { IFormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单折叠面板
 * @author lingxiaoming
 * @date 2024-07-14 01:53:49
 * @export
 * @interface IFormCollapseController
 * @extends {IFormItemBasicController<M, S>}
 * @template M
 * @template S
 */
export interface IFormCollapseController<
  M extends IFormCollapse = IFormCollapse,
  S extends IFormCollapseState = IFormCollapseState,
> extends IFormItemBasicController<M, S> {
  /**
   * 折叠面板类型
   *
   * @author lingxiaoming
   * @date 2024-07-14 01:56:56
   * @type {'collapse'}
   */
  type: 'collapse';
}
