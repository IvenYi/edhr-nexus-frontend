import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';
import { ITable } from '../../table';

/**
 * 表格选择编辑器
 *
 * @export
 * @interface ISelectTableEditor
 * @extends {IEditorBasic}
 */
export interface ISelectTableEditor extends IEditorBasic {
  readonly type: EditorType.SELECT_TABLE;

  /**
   * 表格是否多选
   *
   * @type {boolean}
   */
  multiple?: boolean;

  /**
   * 表格选中行的唯一标识
   *
   * @default 'id'
   * @type {string}
   */
  key?: string;

  /**
   * 是否使用唯一标识作为选中行的值，默认是直接选中对象
   *
   * @type {boolean}
   */
  isKeys?: boolean;

  /**
   * 表格模型
   *
   * @type {ITable}
   */
  tableModel: ITable;

  /**
   * 表格选中回调
   *
   * @param {IObject[]} selectRows 当前选中的表格数据
   */
  onChange?(selectRows: IObject[]): void;
}
