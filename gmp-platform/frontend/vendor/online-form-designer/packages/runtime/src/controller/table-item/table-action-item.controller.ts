import { ITableActionItem, ITableActionItemController } from '../../interface';
import { TableItemController } from './table-item.controller';

/**
 * 表格操作列控制器
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:06
 * @export
 * @class TableActionItemController
 * @extends {TableItemController}
 * @implements {ITableActionItemController}
 */
export class TableActionItemController
  extends TableItemController
  implements ITableActionItemController
{
  declare model: ITableActionItem;
}
