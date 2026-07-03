import { EditorType } from '../../../constants';
import { IEditorBasic } from './i-editor-basic';

/**
 * 图标选择编辑器
 *
 * @author zhanghanrui
 * @date 2024-07-26 10:07:49
 * @export
 * @interface IIconSelectEditor
 * @extends {IEditorBasic}
 */
export interface IIconSelectEditor extends IEditorBasic {
  readonly type: EditorType.ICON_SELECT;

  label?: string;

  size?: number;

  showColor?: boolean;

  showBackground?: boolean;

  defaultIcon?: string;

  defaultColor?: string;

  defaultBackground?: string;
}
