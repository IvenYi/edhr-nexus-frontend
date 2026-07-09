import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';
import { ITable } from '../../table';

/**
 * 表格编辑器
 *
 * @export
 * @interface ITableEditor
 * @extends {IEditorBasic}
 */
export interface ITableEditor extends IEditorBasic {
  readonly type: EditorType.TABLE;

  /**
   * 表格模型
   *
   * @type {ITable}
   */
  tableModel: ITable;
}
