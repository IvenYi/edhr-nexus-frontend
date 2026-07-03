import { IFormItem } from '../../form';
import { IDictionaryItem } from '../../i-code-list/i-code-item';
import { IFormItemState } from '../../state';
import { IFormEditItemController } from '../form-edit-item/form-edit-item.controller';

/**
 * 表单项控制器
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:21
 * @export
 * @interface IFormItemController
 * @extends {IFormEditItemController<M, S>}
 * @template M
 * @template S
 */
export interface IFormItemController<
  M extends IFormItem = IFormItem,
  S extends IFormItemState = IFormItemState,
> extends IFormEditItemController<M, S> {
  /**
   * 项类型
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:59
   * @type {'item'}
   */
  type: 'item';

  /**
   * 加载动态代码表
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:02
   * @return {*}  {Promise<IDictionaryItem[]>}
   */
  loadDictionary(params?: IParams, force?: boolean): Promise<IDictionaryItem[]>;

  /**
   * 清空现有代码表
   *
   * @author zhanghanrui
   * @date 2024-04-03 14:04:05
   */
  clearDictionary(): void;
}
