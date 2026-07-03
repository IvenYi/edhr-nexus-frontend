import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';

/**
 * 复选框滑块编辑器
 *
 * @author zhanghanrui
 * @date 2024-04-02 11:04:43
 * @export
 * @interface ICheckSwitchEditor
 * @extends {IEditorBasic}
 */
export interface ICheckSwitchEditor extends IEditorBasic {
  readonly type: EditorType.CHECK_SWITCH;

  /**
   * 标签名称
   *
   * @author zhanghanrui
   * @date 2024-08-23 17:08:55
   * @type {string}
   */
  label?: string;

  /**
   * 是否是开关
   * @author lingxiaoming
   * @date 2024-07-18 06:55:27
   * @type {boolean}
   */
  isSwitch?: boolean;
}
