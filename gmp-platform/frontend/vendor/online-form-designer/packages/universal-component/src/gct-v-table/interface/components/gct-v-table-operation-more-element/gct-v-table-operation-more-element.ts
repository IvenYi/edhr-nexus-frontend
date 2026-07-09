import { IVTableActionItem } from "../../i-v-table-column/i-v-table-operation-column";

/**
 * 操作列，更多菜单对外暴露的WebComponents接口
 *
 * @export
 * @interface GctVTableOperationMoreElement
 * @extends {HTMLElement}
 */
export interface GctVTableOperationMoreElement extends HTMLElement {
  /**
   * 按钮 x 坐标
   *
   * @type {number}
   */
  x: number;
  /**
   * 按钮 y 坐标
   *
   * @type {number}
   */
  y: number;
  /**
   * 操作项列表
   *
   * @type {IVTableActionItem[]}
   */
  actions: IVTableActionItem[];
  /**
   * 项点击回调
   *
   * @param {IVTableActionItem} action
   */
  onItemClick(action: IVTableActionItem): void;
  /**
   * 关闭回调
   */
  onClose(): void;
}
