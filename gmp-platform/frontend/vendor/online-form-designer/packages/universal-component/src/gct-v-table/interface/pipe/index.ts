import { IVTableDataItem } from '../i-v-table-data-item/i-v-table-data-item';

/**
 * 数据表格数据管道处理接口
 *
 * @export
 * @interface IDataVTablePipe
 */
export interface IDataVTablePipe {
  /**
   * 对加载回来的数据进行管道处理，以及行编辑时，数据变动后的处理
   *
   * @description 只允许修改传入的数据引用，不返回新数据
   * @param {IVTableDataItem[]} data
   * @return {*}  {Promise<void>}
   */
  data?(data: IVTableDataItem[]): Promise<void>;
}

/**
 * 数据表格列数据管道处理接口
 *
 * @export
 * @interface IDataVTableColumnPipe
 */
export interface IDataVTableColumnPipe {
  /**
   * 表格单元格文本格式化函数
   *
   * @param {string} val
   * @param {IObject} record
   * @param {number} rowIndex
   * @param {number} colIndex
   * @return {*}  {Promise<unknown>}
   */
  format?(val: string, record: IObject, rowIndex: number, colIndex: number): Promise<unknown>;
}
