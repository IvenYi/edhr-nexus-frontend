import { EditorType } from '../../../constants';
import { IEditorBasic } from './i-editor-basic';

/**
 * 带单位长度字符串编辑器模型
 * @author lingxiaoming
 * @date 2024-07-17 04:32:52
 * @export
 * @interface ILengthUnit
 * @extends {IEditorBasic}
 */
export interface ILengthUnitEditor extends IEditorBasic {
  readonly type: EditorType.LENGTH_UNIT;
}
