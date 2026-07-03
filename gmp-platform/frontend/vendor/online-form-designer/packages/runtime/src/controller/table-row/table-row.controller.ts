import { reactive } from 'vue';
import {
  ITable,
  ITableController,
  ITableItemController,
  ITableRowController,
  ITableRowState,
} from '../../interface';
import { TableRowState } from '../../state';
import { TableActionItemController } from '../table-item/table-action-item.controller';
import { TableEditItemController } from '../table-item/table-edit-item.controller';
import { TableItemController } from '../table-item/table-item.controller';
import { CountLatch } from '../../utils';

/**
 * 表格行数据控制器
 *
 * @author zhanghanrui
 * @date 2024-04-16 21:04:46
 * @export
 * @class TableRowController
 * @implements {ITableRowController}
 */
export class TableRowController implements ITableRowController {
  item: Record<string, ITableItemController> = {};

  fields: string[] = [];

  state: ITableRowState = this.createState();

  protected activeCount = new CountLatch();

  get key() {
    return this.data[this.model.key];
  }

  constructor(
    public readonly table: ITableController,
    public readonly model: ITable,
    public data: IData,
  ) {}

  async init(): Promise<void> {
    const all = this.model.columns.map<ITableItemController>((col) => {
      let c: ITableItemController | null = null;
      switch (col.type) {
        case 'edit':
          c = new TableEditItemController(this, col);
          break;
        case 'actions':
          c = new TableActionItemController(this, col);
          break;
        default:
          c = new TableItemController(this, col);
      }
      this.fields.push(col.name);
      c.state = reactive(c.state);
      this.item[col.name] = c;
      return c;
    });
    await Promise.all(all);
  }

  change(name: string, newVal: any, oldVal: any): void {
    this.table.change(this, name, newVal, oldVal);
  }

  async destroy(): Promise<void> {
    const keys = Object.keys(this.item);
    const all = keys.map((key) => this.item[key].destroy());
    this.item = {};
    await Promise.all(all);
  }

  active(): void {
    if (this.activeCount.isLock) {
      this.activeCount.lock();
      return;
    }
    this.activeCount.lock();
    this.state.active = true;
    this.activeCount.await().then(() => {
      this.state.active = false;
    });
  }

  unActive(): void {
    this.activeCount.unlock();
  }

  protected createState(): ITableRowState {
    return new TableRowState();
  }
}
