/**
 * span 布局项
 *
 * @author zhanghanrui
 * @date 2024-03-26 19:03:40
 * @export
 * @interface IGridItemSpan
 */
export interface IGridItemSpan {
  /**
   * <576px
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:22
   * @type {number}
   */
  sx?: number;

  /**
   * ≥576px
   *
   * @type {number}
   */
  sm?: number;

  /**
   * ≥768px
   *
   * @type {number}
   */
  md?: number;

  /**
   * ≥992px
   *
   * @type {number}
   */
  lg?: number;

  /**
   * ≥1200px
   *
   * @type {number}
   */
  xl?: number;

  /**
   * ≥1600px
   *
   * @type {number}
   */
  xxl?: number;

  /**
   * ≥1600px
   *
   * @type {number}
   */
  xxxl?: number;
}
