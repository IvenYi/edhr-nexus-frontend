import { EditorType } from '../../../constants';
import { IEditorBasic } from './i-editor-basic';

/**
 * 多行文本域编辑器
 *
 * @author zhanghanrui
 * @date 2024-04-02 11:04:33
 * @export
 * @interface ITextareaEditor
 * @extends {IEditorBasic}
 */
export interface ITextareaEditor extends IEditorBasic {
  readonly type: EditorType.TEXTAREA;

  /**
   * 多行文本行数
   *
   * @author zhanghanrui
   * @date 2024-04-02 16:04:18
   * @type {(boolean | { minRows: number; maxRows: number })}
   */
  autoSize?: boolean | { minRows: number; maxRows: number };
}
