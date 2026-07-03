/**
 * flex 布局项
 *
 * @author zhanghanrui
 * @date 2024-03-26 19:03:07
 * @export
 * @interface IFlexItem
 */
export interface IFlexItem {
  /**
   * order属性定义项目的排列顺序。数值越小，排列越靠前，默认为0
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:48
   * @type {number}
   */
  order?: number;

  /**
   * flex-grow属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:21
   * @type {number}
   */
  flexGrow?: number;

  /**
   * flex-shrink属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:42
   * @type {number}
   */
  flexShrink?: number;

  /**
   * flex-basis属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:03
   * @type {(number | 'auto')}
   */
  flexBasis?: number | 'auto';

  /**
   * align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性
   * 该属性可能取6个值，除了auto，其他都与align-items属性完全一致
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:30
   * @type {('auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch')}
   */
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
}
