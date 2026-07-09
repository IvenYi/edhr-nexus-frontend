import { ITableItemState } from '../../state';
import { ITableItem } from '../../table';
import { ITableRowController } from '../table-row/i-table-row.controller';

/**
 * 表格项控制器
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:58
 * @export
 * @interface ITableItemController
 */
export interface ITableItemController {
  /**
   * 行控制器
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:25
   * @type {ITableRowController}
   */
  row: ITableRowController;

  /**
   * 表格项模型
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:47
   * @type {ITableItem}
   */
  model: ITableItem;

  /**
   * 表格项状态
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:00
   * @type {ITableItemState}
   */
  state: ITableItemState;

  /**
   * 编辑项值
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:49
   * @type {*}
   */
  value: any;

  /**
   * 初始化
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:11
   * @return {*}  {Promise<void>}
   */
  init(): Promise<void>;

  /**
   * 销毁
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:18
   * @return {*}  {Promise<void>}
   */
  destroy(): Promise<void>;
}
