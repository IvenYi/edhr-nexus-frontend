import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';

/**
 * 文本编辑器
 *
 * @author zhanghanrui
 * @date 2024-04-02 11:04:04
 * @export
 * @interface ITextEditor
 * @extends {IEditorBasic}
 */
export interface ITextEditor extends IEditorBasic {
  readonly type: EditorType.TEXT | string;

  /**
   * 前缀
   *
   * @author zhanghanrui
   * @date 2024-04-02 11:04:39
   * @type {string}
   */
  prefix?: string;

  /**
   * 后缀
   *
   * @author zhanghanrui
   * @date 2024-04-02 11:04:42
   * @type {string}
   */
  suffix?: string;

  /**
   * 前置标签
   *
   * @author zhanghanrui
   * @date 2024-04-02 11:04:16
   * @type {string}
   */
  addonBefore?: string;

  /**
   * 后置标签
   *
   * @author zhanghanrui
   * @date 2024-04-02 11:04:20
   * @type {string}
   */
  addonAfter?: string;
}
