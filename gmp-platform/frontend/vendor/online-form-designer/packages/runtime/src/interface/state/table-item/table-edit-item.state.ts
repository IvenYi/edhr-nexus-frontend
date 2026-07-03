import { ITableItemState } from './table-item.state';

/**
 * 表格编辑项的状态
 *
 * @author zhanghanrui
 * @date 2024-04-16 21:04:22
 * @export
 * @interface ITableEditItemState
 * @extends {ITableItemState}
 */
export interface ITableEditItemState extends ITableItemState {
  /**
   * 是否报错
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-16 21:04:46
   * @type {boolean}
   */
  error: boolean;
  /**
   * 报错消息
   *
   * @default ''
   * @author zhanghanrui
   * @date 2024-04-16 21:04:40
   * @type {string}
   */
  errMessage: string;
  /**
   * 是否只读
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-16 20:04:21
   * @type {boolean}
   */
  readonly: boolean;
  /**
   * 是否禁用
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:37
   * @type {boolean}
   */
  disabled: boolean;
}
