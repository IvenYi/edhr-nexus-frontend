import { ITableEditItem, ITableEditItemController, ITableEditItemState } from '../../interface';
import { TableEditItemState } from '../../state';
import { TableItemController } from './table-item.controller';

/**
 * 表格编辑列控制器
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:39
 * @export
 * @class TableEditItemController
 * @extends {TableItemController}
 * @implements {ITableEditItemController}
 */
export class TableEditItemController
  extends TableItemController
  implements ITableEditItemController
{
  declare model: ITableEditItem;

  declare state: ITableEditItemState;

  protected override createState(): ITableEditItemState {
    return new TableEditItemState();
  }

  active(): void {
    return this.row.active();
  }

  unActive(): void {
    return this.row.unActive();
  }
}
