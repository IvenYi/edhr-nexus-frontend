import { IEditorBasic } from '@gct/runtime';
import { DesignEditorType } from '../../constant';

/**
 * 自定义导航菜单配置输入参数
 *
 * @author zhanghanrui
 * @date 2024-08-24 14:08:24
 * @export
 * @interface ICustomExpMenuModel
 * @extends {IEditorBasic}
 */
export interface ICustomExpMenuModel extends IEditorBasic {
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
