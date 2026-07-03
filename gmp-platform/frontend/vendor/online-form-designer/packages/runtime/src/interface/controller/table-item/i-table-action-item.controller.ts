import { ITableActionItem } from '../../table';
import { ITableItemController } from './i-table-item.controller';

/**
 * 表格行为项控制器
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:30
 * @export
 * @interface ITableActionItemController
 * @extends {ITableItemController}
 */
export interface ITableActionItemController extends ITableItemController {
  /**
   * 行为项模型
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:54
   * @type {ITableActionItem}
   */
  model: ITableActionItem;
}
