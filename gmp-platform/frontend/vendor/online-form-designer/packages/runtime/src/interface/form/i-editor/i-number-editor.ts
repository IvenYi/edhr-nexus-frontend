import { ITextEditor } from './i-text-editor';
import { EditorType } from '../../../constants';

/**
 * 数值编辑器
 *
 * @author zhanghanrui
 * @date 2024-04-02 17:04:17
 * @export
 * @interface INumberEditor
 * @extends {ITextEditor}
 */
export interface INumberEditor extends ITextEditor {
  readonly type: EditorType.NUMBER;

  /**
   * 小数精度个数
   * @author lxm
   * @date 2024-05-10 02:53:51
   * @type {number}
   */
  precision?: number;
}
