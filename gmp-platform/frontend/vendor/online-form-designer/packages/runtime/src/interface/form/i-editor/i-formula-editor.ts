import { EditorType } from '../../../constants';
import { IEditorBasic } from './i-editor-basic';

/**
 * 公式编辑器
 *
 * @author chitanda
 * @date 2025-11-03 16:11:54
 * @export
 * @interface IFormulaEditor
 * @extends {IEditorBasic}
 */
export interface IFormulaEditor extends IEditorBasic {
  readonly type: EditorType.FORMULA;

  /**
   * 公式编辑器配置
   *
   * @author chitanda
   * @date 2025-11-03 16:11:51
   * @type {IParams}
   */
  config: IParams;
}
