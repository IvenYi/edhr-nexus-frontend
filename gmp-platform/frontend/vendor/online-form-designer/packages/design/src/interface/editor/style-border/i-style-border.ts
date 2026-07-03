import { DesignEditorType } from '../../../constant';
import { IEditorBasic } from '@gct/runtime';

/**
 * 边框编辑器模型
 * @author lingxiaoming
 * @date 2024-07-17 04:32:52
 * @export
 * @interface IStyleBorder
 * @extends {IEditorBasic}
 */
export interface IStyleBorder extends IEditorBasic {
  readonly type: DesignEditorType.STYLE_BORDER;

  /**
   * 显示编辑区域(默认全显示)
   * - radius 圆角
   * - basics 边框线
   * @author lingxiaoming
   * @date 2024-07-17 06:10:19
   * @type {(Array<'radius' | 'basics'>)}
   */
  showArea?: Array<'radius' | 'basics'>;
}
