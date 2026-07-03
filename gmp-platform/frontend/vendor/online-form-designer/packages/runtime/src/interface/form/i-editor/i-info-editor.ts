import { EditorType } from '../../../constants';
import { ITextEditor } from './i-text-editor';

export interface IInfoEditor extends ITextEditor {
  readonly type: EditorType.INFO;

  /**
   * 图标
   *
   * @author zhanghanrui
   * @date 2024-06-06 17:06:39
   * @type {string}
   */
  icon?: string;

  /**
   * 呈现内容
   *
   * @author zhanghanrui
   * @date 2024-06-06 17:06:51
   * @type {string}
   */
  content?: string;
}
