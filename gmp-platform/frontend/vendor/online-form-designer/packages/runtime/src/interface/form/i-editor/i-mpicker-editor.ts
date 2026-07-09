import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';

/**
 * 数据选择编辑器
 *
 * @author zhanghanrui
 * @date 2024-04-02 11:04:42
 * @export
 * @interface IMPickerEditor
 * @extends {IEditorBasic}
 */
export interface IMPickerEditor extends IEditorBasic {
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
   * 是否强制刷新选项
   *
   * @type {boolean}
   */
  force?: boolean;
}
