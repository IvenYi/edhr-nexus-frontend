import { IGctVTableEditingRowEvent } from '../../events';
import { IVTableDataItem } from '../../i-v-table-data-item/i-v-table-data-item';
import { IVTableEditingCol } from '../i-v-table-editing-col/i-v-table-editing-col';
import type { Emitter } from 'mitt';

/**
 * 正在编辑的表格行实例
 *
 * @export
 * @interface IVTableEditingRow
 */
export interface IVTableEditingRow {
  readonly evt: Emitter<IGctVTableEditingRowEvent>;
  /**
   * 编辑列实例映射表
   *
   * @type {Record<string, IVTableEditingCol>}
   */
  readonly col: Record<string, IVTableEditingCol>;
  /**
   * 行索引
   *
   * @type {number}
   */
  readonly index: number;
  /**
   * 行数据
   *
   * @type {IVTableDataItem}
   */
  readonly data: IVTableDataItem;
  /**
   * 销毁当前编辑行实例
   */
  dispose(): void;
}
