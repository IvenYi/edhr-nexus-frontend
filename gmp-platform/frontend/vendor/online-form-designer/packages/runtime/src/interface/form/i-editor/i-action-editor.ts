import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';
import { IFormController, IFormEditItemController } from '../../controller';

export interface IActionEditor extends IEditorBasic {
  readonly type: EditorType.ACTION;

  /**
   * 按钮名称
   *
   * @type {string}
   */
  label?: string;

  /**
   * 按钮图标
   *
   * @type {string}
   */
  icon?: string;

  /**
   * 按钮点击
   *
   */
  click?: (e: MouseEvent, from: IFormController, item: IFormEditItemController, data: IData) => void;
}
