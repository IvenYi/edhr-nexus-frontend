import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';

export interface ICheckboxEditor extends IEditorBasic {
  readonly type: EditorType.CHECKBOX;
  /**子项的布局方式 */
  layout: 'row' | 'column';
  /**最少选择几项 */
  minLength?: number;
  /**是否支持拖拽排序 */
  isDrag?: boolean;
}
