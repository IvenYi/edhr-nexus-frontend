import { ILayoutContainerBasis } from '../i-layout-basis/i-layout-container-basis';

/**
 * 栅格布局容器
 *
 * @author zhanghanrui
 * @date 2024-03-27 11:03:05
 * @export
 * @interface IGridContainer
 * @extends {ILayoutContainerBasis}
 */
export interface IGridContainer extends ILayoutContainerBasis {
  /**
   * 栅格布局模式，24栅格或12栅格
   *
   * @default 24
   * @author zhanghanrui
   * @date 2024-03-26 19:03:16
   * @type {(12 | 24)}
   */
  mode: 12 | 24;

  /**
   * 栅格间隔
   *
   * @author zhanghanrui
   * @date 2024-03-27 11:03:38
   * @type {(number | Object | number[])}
   */
  gutter?: number | Object | number[];
}
