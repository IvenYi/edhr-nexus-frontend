import { DesignEditorType } from '../../../constant';
import { IEditorBasic } from '@gct/runtime';

/**
 * 文本样式编辑器模型
 * @author lingxiaoming
 * @date 2024-07-17 04:32:52
 * @export
 * @interface IStyleFont
 * @extends {IEditorBasic}
 */
export interface IStyleFont extends IEditorBasic {
  readonly type: DesignEditorType.STYLE_FONT;
}
