import { IFormHiddenItem } from '../../form';
import { IFormHiddenItemState } from '../../state';
import { IFormEditItemController } from '../form-edit-item/form-edit-item.controller';

/**
 * 隐藏表单项控制器，只存在逻辑，不会渲染元素
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:24
 * @export
 * @interface IFormHiddenItemController
 * @extends {IFormEditItemController<M, S>}
 * @template M
 * @template S
 */
export interface IFormHiddenItemController<
  M extends IFormHiddenItem = IFormHiddenItem,
  S extends IFormHiddenItemState = IFormHiddenItemState,
> extends IFormEditItemController<M, S> {
  /**
   * 隐藏表单项类型
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:46
   * @type {'hidden'}
   */
  type: 'hidden';
}
