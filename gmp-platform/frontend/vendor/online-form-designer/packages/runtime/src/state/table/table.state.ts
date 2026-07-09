import { ITableState } from '../../interface';

/**
 * 表格状态
 *
 * @author zhanghanrui
 * @date 2024-04-16 11:04:00
 * @export
 * @class TableState
 * @implements {ITableState}
 */
export class TableState implements ITableState {
  formData: IData = {};
  /**
   * 当前表格数据
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:23
   * @type {IData[]}
   */
  items: IData[] = [];
  /**
   * 当前页面
   *
   * @author zhanghanrui
   * @date 2024-04-16 11:04:04
   * @type {number}
   */
  page: number = 1;
  /**
   * 数据总数
   *
   * @author zhanghanrui
   * @date 2024-04-16 11:04:09
   * @type {number}
   */
  total: number = 0;
  /**
   * 分页数量
   *
   * @author zhanghanrui
   * @date 2024-04-16 11:04:17
   * @type {number}
   */
  size: number = 20;
}
