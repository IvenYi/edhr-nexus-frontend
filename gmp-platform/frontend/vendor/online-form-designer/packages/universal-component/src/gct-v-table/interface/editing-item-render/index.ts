import type { IVTableColumn } from '../i-v-table-column/i-v-table-column';
import type { IVTableDataItem } from '../i-v-table-data-item/i-v-table-data-item';

/**
 * 行编辑项渲染器属性接口
 *
 * @export
 * @interface IVTableEditingItemRenderProps
 */
export interface IVTableEditingItemRenderProps {
  /**
   * 表格列配置
   *
   * @type {IVTableColumn}
   */
  col: IVTableColumn;
  /**
   * 表格行数据
   *
   * @type {IVTableDataItem}
   */
  record: IVTableDataItem;
}
