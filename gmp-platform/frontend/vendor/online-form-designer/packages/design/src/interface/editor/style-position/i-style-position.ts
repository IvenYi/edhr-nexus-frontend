import { DesignEditorType } from '../../../constant';
import { IEditorBasic } from '@gct/runtime';

/**
 * 定位编辑器模型
 * @author lingxiaoming
 * @date 2024-07-17 04:32:52
 * @export
 * @interface IStylePosition
 * @extends {IEditorBasic}
 */
export interface IStylePosition extends IEditorBasic {
  readonly type: DesignEditorType.STYLE_POSITION;
}
