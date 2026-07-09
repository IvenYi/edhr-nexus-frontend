import { IGridItemSpan } from './i-grid-item-span';

// 栅格布局列
type ColNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;

/**
 * 表格布局项
 *
 * @author zhanghanrui
 * @date 2024-03-26 19:03:43
 * @export
 * @interface IGridItem
 */
export interface IGridItem {
  /**
   * 栅格占位格数
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:53
   * @type {(ColNumber | IGridItemSpan)}
   */
  span?: ColNumber | IGridItemSpan;
  /**
   * 偏移量
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:55
   * @type {ColNumber}
   */
  offset?: ColNumber;
  /**
   * 栅格顺序
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:17
   * @type {number}
   */
  order?: number;
}
