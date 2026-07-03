import type { IDataVTable } from './i-data-v-table/i-data-v-table';

/**
 * GctVTable 组件的 props 接口定义
 *
 * @author chitanda
 * @date 2025-11-08 15:11:48
 * @export
 * @interface IGctVTableProps
 */
export interface IGctVTableProps {
  /**
   * 表格基本配置
   *
   * @type {IDataVTable}
   */
  config: IDataVTable;
}
