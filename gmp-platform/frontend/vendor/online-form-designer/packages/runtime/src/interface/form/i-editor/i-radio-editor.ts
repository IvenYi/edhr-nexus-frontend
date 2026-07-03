import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';

/**
 * 单选框编辑器
 *
 * @author zhanghanrui
 * @date 2024-04-02 11:04:43
 * @export
 * @interface IRadioEditor
 * @extends {IEditorBasic}
 */
export interface IRadioEditor extends IEditorBasic {
  readonly type: EditorType.RADIO;

  /**
   * 选项图片位置
   *
   * @type {('left' | 'top')}
   */
  icon: {
    pos: 'left' | 'top';
    width: string;
    height: string;
    fontSize?: string;
  };

  /**
   * 是否是按钮样式
   * @author lingxiaoming
   * @date 2024-07-18 07:43:27
   * @type {boolean}
   */
  buttonMode?: boolean;
}
