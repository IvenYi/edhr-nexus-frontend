import { IEditorBasic } from './i-editor-basic';
import { EditorType } from '../../../constants';

/**
 * 下拉选择编辑器
 *
 * @author zhanghanrui
 * @date 2024-04-02 11:04:43
 * @export
 * @interface ISelectEditor
 * @extends {IEditorBasic}
 */
export interface ISelectEditor extends IEditorBasic {
  readonly type: EditorType.SELECT;

  /**
   * 是否当前为下拉容器
   *
   * @default true
   * @type {boolean}
   */
  isSelfContainer: boolean;

  nameField?: string;

  /**
   * 分组是否可收缩
   *
   * @default false
   * @type {boolean}
   */
  groupCollapsible?: boolean;

  /**
   * 分组前缀文本
   *
   * @author chitanda
   * @date 2025-06-17 16:06:28
   * @type {string}
   */
  beforeText: string;

  /**
   * 分组后缀文本
   *
   * @author chitanda
   * @date 2025-06-17 16:06:31
   * @type {string}
   */
  afterText: string;
}
