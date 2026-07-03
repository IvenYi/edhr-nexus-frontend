import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';

/**
 * 数据选择编辑器
 *
 * @author zhanghanrui
 * @date 2024-04-02 11:04:42
 * @export
 * @interface IPickerEditor
 * @extends {IEditorBasic}
 */
export interface IPickerEditor extends IEditorBasic {
  readonly type: EditorType.PICKER;

  /**
   * 是否支持搜索
   *
   * @author zhanghanrui
   * @date 2024-04-02 17:04:53
   * @type {boolean}
   */
  isSearch?: boolean;

  /**
   * 显示字段文本名称
   *
   * @author zhanghanrui
   * @date 2024-10-12 15:10:47
   * @type {string}
   */
  nameField?: string;

  /**
   * 字段映射，在值选中后，额外填充的字段
   *
   * @description 例如：['name:name', 'id:id']，表示选中后，额外填充 name 和 id 字段，:前是选中的数据集中的字段，:后是当前表单的字段
   * @type {string[]}
   */
  fieldMap?: string[];
}
