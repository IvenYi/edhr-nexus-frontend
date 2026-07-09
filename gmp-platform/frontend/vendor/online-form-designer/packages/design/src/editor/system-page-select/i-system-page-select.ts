import { IEditorBasic } from '@gct/runtime';
import { DesignEditorType } from '../../constant';

/**
 *
 *
 * @author zhanghanrui
 * @date 2024-09-22 14:09:38
 * @export
 * @interface ISystemPageSelectModel
 * @extends {IEditorBasic}
 */
export interface ISystemPageSelectModel extends IEditorBasic {
  readonly type: DesignEditorType.CUSTOM_EXP_MENU;

  /**
   * 最大激活数量，默认最大激活5个
   *
   * @default 5
   * @author zhanghanrui
   * @date 2024-08-24 14:08:09
   * @type {number}
   */
  activeMax?: number;
}
