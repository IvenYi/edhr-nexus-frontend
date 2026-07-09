import {
  ITableItem,
  ITableItemController,
  ITableItemState,
  ITableRowController,
} from '../../interface';
import { TableITemState } from '../../state';

/**
 * 表格项控制器
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:14
 * @export
 * @class TableItemController
 * @implements {ITableItemController}
 */
export class TableItemController implements ITableItemController {
  state: ITableItemState = this.createState();

  get value(): any {
    return this.row.data[this.model.dataIndex];
  }

  set value(val: any) {
    const oldVal = this.row.data[this.model.dataIndex];
    this.row.data[this.model.dataIndex] = val;
    this.row.change(this.model.name, val, oldVal);
  }

  constructor(
    public readonly row: ITableRowController,
    public readonly model: ITableItem,
  ) {}

  protected createState(): ITableItemState {
    return new TableITemState();
  }

  async init(): Promise<void> {
    // todo
  }

  async destroy(): Promise<void> {
    // todo
  }
}
