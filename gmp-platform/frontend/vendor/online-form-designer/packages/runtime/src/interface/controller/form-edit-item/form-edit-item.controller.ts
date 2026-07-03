import { IFormEditItem } from '../../form';
import { IFormEditItemState } from '../../state';
import { IFormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单编辑项控制器
 *
 * @author zhanghanrui
 * @date 2024-04-02 20:04:55
 * @export
 * @interface IFormEditItemController
 * @extends {IFormItemBasicController<M, S>}
 * @template M
 * @template S
 */
export interface IFormEditItemController<
  M extends IFormEditItem = IFormEditItem,
  S extends IFormEditItemState = IFormEditItemState,
> extends IFormItemBasicController<M, S> {
  /**
   * 获取值
   *
   * @author zhanghanrui
   * @date 2024-04-02 09:04:18
   * @return {*}  {*}
   */
  value: any;

  /**
   * 编辑器使用的值(兼容多值处理)
   *
   * @author lingxiaoming
   * @date 2024-07-18 10:37:37
   * @type {*}
   */
  editorValue: any;

  /**
   * 项数据键
   *
   * @author zhanghanrui
   * @date 2024-04-03 11:04:21
   * @type {string}
   */
  key: string;

  /**
   * 重置表单项值
   *
   * @author zhanghanrui
   * @date 2024-04-02 20:04:15
   */
  reset(): void;

  /**
   * 设置默认值
   *
   * @author zhanghanrui
   * @date 2024-08-06 10:08:15
   */
  defaultValue(): void;

  /**
   * 失焦
   *
   */
  blur(): void;
}
