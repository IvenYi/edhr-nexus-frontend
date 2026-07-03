import { StyleValue } from 'vue';
import { IFlexItem, IGridItem } from '../../layout';
import { IFormItemProvider } from '../../provider';
import {
  IFormController,
  IFormEditItemController,
  // IFormItemBasicController,
} from '../../controller';

/**
 * 表单项基础
 *
 * @author zhanghanrui
 * @date 2024-03-26 20:03:37
 * @export
 * @interface IFormItemBasic
 */
export interface IFormItemBasic {
  /**
   * 项类型
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:30
   * @type {string} 具体类型由子类定义
   */
  type: string;

  /**
   * 表单项名称
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:43
   * @type {string}
   */
  name: string;

  /**
   * 表单项高度
   *
   * @author zhanghanrui
   * @date 2024-04-02 15:04:02
   * @type {string}
   */
  height?: string;

  /**
   * 表单项宽度
   *
   * @author zhanghanrui
   * @date 2024-04-02 15:04:24
   * @type {string}
   */
  width?: string;

  /**
   * 内间距
   *
   * @author zhanghanrui
   * @date 2024-06-06 17:06:30
   * @type {string}
   */
  padding?: string;

  /**
   * 外间距
   *
   * @author zhanghanrui
   * @date 2024-06-06 17:06:16
   * @type {string}
   */
  margin?: string;

  /**
   * 容器作为 flex 布局子元素的参数
   *
   * @author zhanghanrui
   * @date 2024-03-27 11:03:35
   * @type {IFlexItem}
   */
  flexItem?: IFlexItem;

  /**
   * 容器作为栅格布局子元素的参数
   *
   * @author zhanghanrui
   * @date 2024-03-27 11:03:56
   * @type {IGridItem}
   */
  gridItem?: IGridItem;

  /**
   * 额外的类名
   * @author lingxiaoming
   * @date 2024-07-18 01:05:19
   * @type {*}
   */
  class?: any;

  /**
   * 额外行内的样式
   * @author lingxiaoming
   * @date 2024-07-18 01:05:33
   * @type {StyleValue}
   */
  style?: StyleValue;

  /**
   * 独立适配器
   *
   * @author zhanghanrui
   * @date 2024-04-03 13:04:21
   */
  provider?: (...args: any[]) => IFormItemProvider;

  /**
   * 表单项隐藏计算
   *
   * @author zhanghanrui
   * @date 2024-08-01 11:08:16
   * @param {IFormController} form 表单控制器实例
   * @param {IFormEditItemController} item 当前表单项控制器实例
   * @param {IData} data 表单数据
   * @return {*}  {boolean}
   */
  hidden?(form: IFormController, item: IFormEditItemController, data: IData): boolean;

  /**
   * 表单项状态变更
   *
   * @author chitanda
   * @date 2025-06-24 09:06:27
   * @param {string} stateKey 状态标识
   * @param {*} newState 新状态
   * @param {*} oldState 旧状态
   * @param {IFormController} form 表单控制器实例
   * @param {IFormItemBasicController} item 当前表单项控制器实例
   * @param {IData} data 表单数据
   * @returns {*}  {void}
   */
  // state?(
  //   stateKey: string,
  //   newState: any,
  //   oldState: any,
  //   form: IFormController,
  //   item: IFormItemBasicController,
  //   data: IData,
  // ): void;

  /**
   * 表单项值变更
   *
   * @author zhanghanrui
   * @date 2024-08-02 16:08:41
   * @param {IFormController} form 表单控制器实例
   * @param {IFormEditItemController} item 当前表单项控制器实例
   * @param {*} [val] 变更后的值
   * @param {*} [oldVal] 变更前的值
   */
  watch?(form: IFormController, item: IFormEditItemController, val?: any, oldVal?: any): void;

  /**
   * 表单项值变更回调
   *
   * @author zhanghanrui
   * @date 2024-08-02 16:08:41
   * @param {IFormController} form 表单控制器实例
   * @param {IFormEditItemController} item 当前表单项控制器实例
   * @param {IData} data 表单数据
   */
  change?(form: IFormController, item: IFormEditItemController, data: IData): void;
}
