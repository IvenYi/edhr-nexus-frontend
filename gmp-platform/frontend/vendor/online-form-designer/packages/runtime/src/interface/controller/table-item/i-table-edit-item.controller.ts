import { ITableEditItemState } from '../../state';
import { ITableEditItem } from '../../table';
import { ITableItemController } from './i-table-item.controller';

/**
 * 表格编辑项控制器
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:09
 * @export
 * @interface ITableEditItemController
 * @extends {ITableItemController}
 */
export interface ITableEditItemController extends ITableItemController {
  /**
   * 编辑项模型
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:14
   * @type {ITableEditItem}
   */
  model: ITableEditItem;

  /**
   * 编辑项状态
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:29
   * @type {ITableEditItemState}
   */
  state: ITableEditItemState;

  /**
   * 激活
   *
   * @author zhanghanrui
   * @date 2024-04-17 18:04:36
   */
  active(): void;

  /**
   * 取消激活
   *
   * @author zhanghanrui
   * @date 2024-04-17 18:04:47
   */
  unActive(): void;
}
