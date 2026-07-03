import { IEditorBasic } from '../../form';
import { ICodeItem } from '../../i-code-list/i-code-item';

/**
 * 编辑器控制器
 *
 * @author zhanghanrui
 * @date 2024-04-02 13:04:35
 * @export
 * @interface IEditorController
 */
export interface IEditorController<M extends IEditorBasic = IEditorBasic> {
  /**
   * 编辑器模型
   *
   * @author zhanghanrui
   * @date 2024-04-02 13:04:51
   * @type {IEditorBasic}
   */
  readonly model: M;

  /**
   * 编辑器数据字典
   *
   * @author zhanghanrui
   * @date 2024-04-02 13:04:22
   * @type {ICodeItem[]}
   */
  options: ICodeItem[];
}
