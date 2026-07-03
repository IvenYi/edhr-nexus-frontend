import { EditorType } from '../../../constants';
import { IEditorBasic } from './i-editor-basic';

/**
 * 开关编辑器
 *
 * @author zhanghanrui
 * @date 2024-07-29 13:07:53
 * @export
 * @interface ISwitchEditor
 * @extends {IEditorBasic}
 */
export interface ISwitchEditor extends IEditorBasic {
  readonly type: EditorType.SWITCH;
}
