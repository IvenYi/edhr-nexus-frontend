import { IFlexContainer, IGridContainer } from '../../layout';
import { IFormItemBasic } from './i-form-item-basic';

/**
 * 表单容器类型基础
 *
 * @author zhanghanrui
 * @date 2024-03-26 20:03:35
 * @export
 * @interface IFormContainer
 * @extends {IFormItemBasic}
 */
export interface IFormContainer extends IFormItemBasic {
  /**
   * 表单容器
   *
   * @author zhanghanrui
   * @date 2024-04-01 15:04:25
   * @type {'container'}
   */
  type: 'container' | string;

  /**
   * 布局模式
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:31
   * @type {('flex' | 'grid')}
   */
  layout: 'flex' | 'grid';

  /**
   * flex box 流式布局
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:25
   * @type {IFlexContainer}
   */
  flex?: IFlexContainer;

  /**
   * 栅格布局
   *
   * @author zhanghanrui
   * @date 2024-03-26 19:03:22
   * @type {IGridContainer}
   */
  grid?: IGridContainer;

  /**
   * 子元素
   *
   * @author zhanghanrui
   * @date 2024-04-01 15:04:57
   * @type {IFormItemBasic[]}
   */
  children?: IFormItemBasic[];
}
