import { EditorType } from '../../../constants';
import { IEditorBasic } from './i-editor-basic';

/**
 * 颜色选择编辑器模型
 * @author lingxiaoming
 * @date 2024-07-17 04:32:52
 * @export
 * @interface IColor
 * @extends {IEditorBasic}
 */
export interface IColorEditor extends IEditorBasic {
  readonly type: EditorType.COLOR;
}
