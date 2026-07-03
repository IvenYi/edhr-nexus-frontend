import { onUnmounted, reactive } from 'vue';
import {
  ITable,
  ITableController,
  ITableEditItem,
  ITableEditorProvider,
  ITableEvent,
  ITableItem,
  ITableRowController,
  ITableState,
} from '../../interface';
import { TableState } from '../../state';
import { TableRowController } from '../table-row/table-row.controller';
import { EditorRegisterConst } from '../../constants';
import { QXEvent } from 'qx-util';
import { defaults, isNil } from 'lodash-es';

/**
 * 表格控制器
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:05
 * @export
 * @class GctTableController
 * @implements {ITableController}
 */
export class GctTableController implements ITableController {
  readonly evt: QXEvent<ITableEvent> = new QXEvent();

  state: ITableState = this.createState();

  row: Record<string, ITableRowController> = {};

  editorProviders: Record<string, ITableEditorProvider> = {};

  /**
   * Creates an instance of GctTableController.
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:10
   * @param {ITable} model
   */
  constructor(public model: ITable) {
    this.init();
  }

  protected init(): void {
    this.initTableItems(this.model.columns);
  }

  protected initTableItems(items: ITableItem[]): void {
    if (items) {
      items.forEach((item) => {
        if (item.type === 'edit') {
          const provider = gct.register.tableEditor.get(
            EditorRegisterConst.PREFIX + (item as ITableEditItem).editor.type!,
          );
          if (provider) {
            this.editorProviders[item.name] = provider;
          }
        }
      });
    }
  }

  async setData(items: IData[]): Promise<void> {
    await this.destroyControllers();
    await this.initControllers(items);
    this.state.items = items || [];
  }

  getData(): IData[] {
    return this.state.items;
  }

  protected createState(): ITableState {
    return new TableState();
  }

  protected async initControllers(items: IData[]): Promise<void> {
    const all = items.map((row) => {
      const id = row[this.model.key];
      if (this.row[id]) {
        // 已存在行控制器实例的，就不需要再次实例化了。避免状态被冲掉
        return;
      }
      const c = new TableRowController(this, this.model, row);
      c.state = reactive(c.state);
      c.data = reactive(c.data);
      this.row[id] = c;
      // 将行数据映射入表单
      {
        const keys = Object.keys(row);
        keys.forEach((key) => {
          this.state.formData[`${key}___${id}`] = row[key];
        });
      }
      return c.init();
    });
    await Promise.all(all);
  }

  protected async destroyControllers(): Promise<void> {
    // 销毁时还存在的数据
    const keys = this.state.items.map((item) => item[this.model.key]);
    // 不存在数据的行控制器标识
    const filterKeys = Object.keys(this.row).filter((key) => !keys.includes(key));
    const all = filterKeys.map((key) => {
      const c = this.row[key];
      delete this.row[key];
      // 删除历史遗留表单数据
      {
        const keys = Object.keys(c.data);
        const id = c.data[this.model.key];
        keys.forEach((key) => {
          const tag = `${key}___${id}`;
          delete this.state.formData[tag];
        });
      }
      return c.destroy();
    });
    await Promise.all(all);
  }

  async load(params: IParams = {}): Promise<void> {
    defaults(params, {
      page: this.state.page,
      size: this.state.size,
    });
    if (this.model.fetch) {
      const items = await this.model.fetch(params, this);
      this.state.items = items;
      this.destroyControllers();
      this.initControllers(this.state.items);
    }
  }

  async reload(params?: IParams): Promise<void> {
    await this.load(params);
  }

  async search(params?: IParams): Promise<void> {
    await this.reload(params);
  }

  async refresh(params?: IParams): Promise<void> {
    await this.load(params);
  }

  destroy(): void {
    this.evt.reset();
  }

  change(row: ITableRowController, name: string, newVal: any, oldVal: any): void {
    const data = this.state.items.find((item) => item[this.model.key] === row.key);
    if (data) {
      Object.assign(data, row.data);
      this.state.formData[`${name}___${data[this.model.key]}`] = newVal;
      this.evt.emit('change', data, name, newVal, oldVal);
    }
  }

  updatePagination(data: { total?: number; size?: number; page?: number }): void {
    if (!isNil(data.total)) {
      this.state.total = data.total!;
    }
    if (!isNil(data.size)) {
      this.state.size = data.size!;
    }
    if (!isNil(data.page)) {
      this.state.page = data.page!;
    }
  }
}

/**
 * 获取编辑表单控制器实例
 *
 * @author zhanghanrui
 * @date 2024-04-01 18:04:13
 * @export
 * @param {IEditForm} model
 * @return {*}  {EditFormController}
 */
export function useTableController(fn: () => ITableController): ITableController {
  const c = fn();
  c.state = reactive(c.state);
  onUnmounted(() => c.destroy());
  return c;
}
