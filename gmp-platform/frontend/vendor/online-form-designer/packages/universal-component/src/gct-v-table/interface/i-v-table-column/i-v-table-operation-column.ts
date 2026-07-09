import { ButtonSize, ButtonType } from '@gct/runtime';
import type { IVTableColumn } from './i-v-table-column';

/**
 * 操作确认配置
 *
 * @author chitanda
 * @date 2025-11-08 15:11:48
 * @interface IVTableActionConfirm
 */
export interface IVTableActionConfirm {
  /**
   * 显示位置
   *
   * @author chitanda
   * @date 2025-11-08 15:11:10
   * @type {string}
   */
  placement?: string;
  /**
   * 取消按钮文字
   *
   * @author chitanda
   * @date 2025-11-08 15:11:42
   * @type {string}
   */
  cancelText?: string;
  /**
   * 确认按钮文字
   *
   * @author chitanda
   * @date 2025-11-08 15:11:36
   * @type {string}
   */
  okText?: string;
  /**
   * 确认框描述
   *
   * @author chitanda
   * @date 2025-11-08 15:11:30
   * @type {string}
   */
  title?: string;
}

/**
 * 操作列项
 *
 * @description icon 或 text 配哪个，显示哪个
 * @author chitanda
 * @date 2025-11-08 15:11:57
 * @interface IVTableActionItem
 */
export interface IVTableActionItem {
  /**
   * 模式(默认为项，分割时线需特殊指定)
   *
   * @author chitanda
   * @date 2025-11-08 15:11:25
   * @type {('item' | 'divider')}
   */
  mode?: 'item' | 'divider';
  /**
   * 按钮尺寸
   *
   * @type {ButtonSize}
   */
  size: ButtonSize;
  /**
   * 行为标识
   *
   * @author chitanda
   * @date 2025-11-08 15:11:33
   * @type {string}
   */
  tag: string;
  /**
   * 按钮图标
   *
   * @author chitanda
   * @date 2025-11-08 15:11:41
   * @type {string}
   */
  icon?: string;
  /**
   * 按钮文字
   *
   * @author chitanda
   * @date 2025-11-08 15:11:46
   * @type {string}
   */
  text?: string;
  /**
   * 按钮类型
   *
   * @author chitanda
   * @date 2025-11-08 15:11:56
   * @type {ButtonType}
   */
  type?: ButtonType;
  /**
   * 危险类型按钮
   *
   * @type {boolean}
   */
  danger?: boolean;
  /**
   * 文字颜色
   *
   * @type {string}
   */
  color?: string;
  /**
   * 背景颜色
   *
   * @type {string}
   */
  bgColor?: string;
  /**
   * 操作确认气泡相关配置
   *
   * @author chitanda
   * @date 2025-11-08 15:11:49
   * @type {IVTableActionConfirm}
   */
  confirm?: IVTableActionConfirm;
  /**
   * 是否还有子项操作按钮
   *
   * @type {IVTableActionItem[]}
   */
  children?: IVTableActionItem[];
  /**
   * 更具行数据判断是否隐藏当前行为
   *
   * @param {IData} row
   * @param {number} [rowIndex]
   * @returns {*}  {(Promise<boolean> | boolean)}
   */
  hidden(row: IData, rowIndex?: number): Promise<boolean> | boolean;
  /**
   * 按钮点击事件，返回异步 Promise 用于控制按钮点击后 loading 控制
   *
   * @author chitanda
   * @date 2025-11-08 15:11:15
   * @param {IData} row
   * @param {number} [rowIndex]
   * @returns {*}  {(Promise<void> | void)}
   */
  action?(row: IData, rowIndex?: number): Promise<void> | void;
  /**
   * 原始配置项
   *
   * @type {IObject}
   */
  _item?: IObject;
}

/**
 * 表格操作列配置
 *
 * @author chitanda
 * @date 2025-11-08 15:11:00
 * @export
 * @interface IVTableOperationColumn
 * @extends {IVTableColumn}
 */
export interface IVTableOperationColumn extends IVTableColumn {
  /**
   * 默认显示的按钮数量，其余的走 tip 形式打开
   *
   * @type {number}
   */
  visibleButtons?: number;
  /**
   * 操作列所有项
   *
   * @author chitanda
   * @date 2025-11-08 15:11:45
   * @type {IVTableActionItem[]}
   */
  actions: IVTableActionItem[];
  /**
   * 按钮点击
   *
   * @param {IVTableActionItem} action
   * @param {IData} row
   * @param {number} [rowIndex]
   * @returns {*}  {(Promise<void> | void)}
   */
  action?(action: IVTableActionItem, row: IData, rowIndex?: number): Promise<void> | void;
}
