import { ITableItem } from './i-table-item';
import { TooltipPlacement } from 'ant-design-vue/es/tooltip';

interface IActionConfirm {
  /**
   * 显示位置
   * @author lingxiaoming
   * @date 2024-07-12 04:57:54
   * @type {TooltipPlacement}
   */
  placement?: TooltipPlacement;

  /**
   * 取消按钮文字
   * @author lingxiaoming
   * @date 2024-07-12 04:58:37
   * @type {string}
   */
  cancelText?: string;

  /**
   * 确认按钮文字
   * @author lingxiaoming
   * @date 2024-07-12 04:59:19
   * @type {string}
   */
  okText?: string;

  /**
   * 确认框描述
   * @author lingxiaoming
   * @date 2024-07-12 04:59:53
   * @type {string}
   */
  title?: string;
}

/**
 * 操作列项
 *
 * @description icon 或 text 配哪个，显示哪个
 * @author zhanghanrui
 * @date 2024-04-15 18:04:53
 * @interface IActionItem
 */
interface IActionItem {
  /**
   * 模式(默认为项，分割时线需特殊指定)
   *
   * @author zhanghanrui
   * @date 2024-07-11 17:07:26
   * @type {('item' | 'divider')}
   */
  mode?: 'item' | 'divider';
  /**
   * 行为标识
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:58
   * @type {string}
   */
  tag: string;
  /**
   * 按钮图标
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:07
   * @type {string}
   */
  icon?: string;
  /**
   * 按钮文字
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:12
   * @type {string}
   */
  text?: string;
  /**
   * 按钮类型
   *
   * @author zhanghanrui
   * @date 2024-07-11 17:07:16
   * @type {string}
   */
  type?: string;
  /**
   * 操作确认气泡相关配置
   * @author lingxiaoming
   * @date 2024-07-12 04:55:03
   * @type {IActionConfirm}
   */
  confirm?: IActionConfirm;
  /**
   * 更具行数据判断是否隐藏当前行为
   *
   * @param row 行数据
   */
  hidden?(row: IData): boolean;
  /**
   * 按钮点击事件，返回异步 Promise 用于控制按钮点击后 loading 控制
   *
   * @param {IData} row
   * @returns {*}  {(Promise<void>) | void}
   */
  action?(row: IData): Promise<void> | void;
  /**
   * 按钮属性
   *
   * @type {IObject}
   */
  props?: IObject;
}

/**
 * 行为项(操作列)
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:04
 * @export
 * @interface ITableActionItem
 * @extends {ITableItem}
 */
export interface ITableActionItem extends ITableItem {
  /**
   * 操作列所有项
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:18
   * @type {IActionItem[]}
   */
  actions: IActionItem[];
  /**
   * 行为项操作
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:42
   */
  action: (tag: string, row: IData) => Promise<void> | void;
}
