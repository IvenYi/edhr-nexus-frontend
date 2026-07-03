import { DesignEditorType } from '../../../constant';
import { IEditorBasic } from '@gct/runtime';

/**
 * 边距编辑器模型
 * @author lingxiaoming
 * @date 2024-07-17 04:32:52
 * @export
 * @interface IStyleSpacing
 * @extends {IEditorBasic}
 */
export interface IStyleSpacing extends IEditorBasic {
  readonly type: DesignEditorType.STYLE_SPACING;

  /**
   * 显示编辑区域(默认全显示)
   * - padding 内边距
   * - margin 外边距
   * @author lingxiaoming
   * @date 2024-07-17 06:10:19
   * @type {(Array<'padding' | 'margin'>)}
   */
  showArea?: Array<'padding' | 'margin'>;
}
