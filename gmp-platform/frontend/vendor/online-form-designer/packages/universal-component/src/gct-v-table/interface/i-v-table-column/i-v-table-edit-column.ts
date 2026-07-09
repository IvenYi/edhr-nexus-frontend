import { LowCodeWidget } from '@gct/runtime';
import { IVTableDataItem } from '../i-v-table-data-item/i-v-table-data-item';
import type { IVTableColumn } from './i-v-table-column';
import { IVTableColumnEditor } from './i-v-table-column-editor';

/**
 * 表格编辑列配置
 *
 * @author chitanda
 * @date 2025-11-08 15:11:34
 * @export
 * @interface IVTableEditColumn
 * @extends {IVTableColumn}
 */
export interface IVTableEditColumn extends IVTableColumn {
  /**
   * 编辑项
   *
   * @type {'edit'}
   */
  type: 'edit';

  /**
   * 是否必填
   */
  required?: boolean | ((widget: LowCodeWidget.BasicSchema, record?: IVTableDataItem) => boolean);

  /**
   * 只读状态
   *
   * @type {boolean}
   */
  readonly?: boolean | ((widget: LowCodeWidget.BasicSchema, record?: IVTableDataItem) => boolean);

  /**
   * 是否禁用，默认不禁用
   *
   * @type {boolean}
   */
  disabled?: boolean | ((widget: LowCodeWidget.BasicSchema, record?: IVTableDataItem) => boolean);

  /**
   * 自定义编辑器配置
   *
   * @type {IVTableColumnEditor}
   */
  editor?: IVTableColumnEditor;
}
