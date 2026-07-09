import { ILayoutContainerBasis } from '../i-layout-basis/i-layout-container-basis';

/**
 * flex 布局容器
 *
 * @author zhanghanrui
 * @date 2024-03-27 11:03:48
 * @export
 * @interface IFlexContainer
 * @extends {ILayoutContainerBasis}
 */
export interface IFlexContainer extends ILayoutContainerBasis {
  /**
   * 主轴方向
   * row（默认值）：主轴为水平方向，起点在左端。
   * row-reverse：主轴为水平方向，起点在右端。
   * column：主轴为垂直方向，起点在上沿。
   * column-reverse：主轴为垂直方向，起点在下沿。
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:47
   * @type {('row' | 'row-reverse' | 'column' | 'column-reverse')}
   */
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';

  /**
   * 换行模式
   * nowrap（默认）：不换行
   * wrap：换行，第一行在上方
   * wrap-reverse：换行，第一行在下方
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:09
   * @type {('nowrap' | 'wrap' | 'wrap-reverse')}
   */
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';

  /**
   * 主轴对齐方式
   * flex-start（默认值）：左对齐
   * flex-end：右对齐
   * center： 居中
   * space-between：两端对齐，项目之间的间隔都相等
   * space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:38
   * @type {('flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around')}
   */
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';

  /**
   * 交叉轴对齐方式
   * flex-start：交叉轴的起点对齐
   * flex-end：交叉轴的终点对齐
   * center：交叉轴的中点对齐
   * baseline: 项目的第一行文字的基线对齐
   * stretch（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:26
   * @type {('flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch')}
   */
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

  /**
   * 多根轴线的对齐方式
   * flex-start：与交叉轴的起点对齐
   * flex-end：与交叉轴的终点对齐
   * center：与交叉轴的中点对齐
   * space-between：与交叉轴两端对齐，轴线之间的间隔平均分布
   * space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍
   * stretch（默认值）：轴线占满整个交叉轴
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:20
   * @type {('flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch')}
   */
  alignContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'stretch';
}
