import { EditorType } from '../../../constants';
import { ITextEditor } from './i-text-editor';

/**
 * 纯文本展示编辑器
 *
 * @author zhanghanrui
 * @date 2024-04-08 13:04:47
 * @export
 * @interface ISpanEditor
 * @extends {ITextEditor}
 */
export interface ISpanEditor extends ITextEditor {
  readonly type: EditorType.SPAN;

  /**
   * 是否可复制
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-08 13:04:21
   * @type {boolean}
   */
  copy?: boolean;

  /**
   * 展示的前置字体图标
   *
   * @author zhanghanrui
   * @date 2024-04-24 16:04:23
   */
  icon?: string | ((data: IData) => string);
}
