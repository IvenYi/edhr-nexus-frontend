import mitt, { Emitter } from 'mitt';
import {
  IVTableEditingCol,
  IVTableEditingRow,
  IGctVTableEditingRowEvent,
  IVTableDataItem,
  IVTableEditColumn,
} from '../../interface';
import { VTableEditingCol } from '../v-table-editing-col/v-table-editing-col';

/**
 * 表格编辑行
 *
 * @export
 * @class VTableEditingRow
 */
export class VTableEditingRow implements IVTableEditingRow {
  readonly evt: Emitter<IGctVTableEditingRowEvent> = mitt<IGctVTableEditingRowEvent>();

  readonly col: Record<string, IVTableEditingCol> = {};

  readonly data: IVTableDataItem;

  constructor(
    protected columns: IVTableEditColumn[],
    public readonly index: number,
    data: IVTableDataItem,
  ) {
    this.data = this.createDataProxy(data);
    this.initCols(data);
  }

  /**
   * 为 data 对象创建代理，拦截属性的读取和修改
   * 读取时如果存在对应的 col，则使用 col.value 获取值
   * 修改时如果存在对应的 col，则使用 col.value 修改值
   *
   * @protected
   * @param {IVTableDataItem} data
   * @return {*}  {IVTableDataItem}
   */
  protected createDataProxy(data: IVTableDataItem): IVTableDataItem {
    return new Proxy(data, {
      get: (target, property) => {
        const propKey = property as string;
        // 如果存在对应的列，使用 col.value 获取值
        if (this.col[propKey]) {
          return this.col[propKey].value;
        }
        // 否则直接获取 data 对象的值
        return target[propKey];
      },
      set: (target, property, value) => {
        const propKey = property as string;
        // 如果存在对应的列，使用 col.value 修改值
        if (this.col[propKey]) {
          this.col[propKey].value = value;
        } else {
          // 否则直接修改 data 对象
          target[propKey] = value;
        }
        return true;
      },
    });
  }

  protected initCols(data: IVTableDataItem): void {
    this.columns.forEach((col) => {
      const editingCol = new VTableEditingCol(this, data, col);
      this.col[col.name] = editingCol;
    });
    this.columns.forEach((col) => {
      this.col[col.name].init();
    });
  }

  dispose(): void {
    // 销毁所有编辑列实例
    Object.values(this.col).forEach((editingCol) => {
      editingCol.dispose();
    });
    // 清理事件监听器
    this.evt.all.clear();
  }
}
