import { ITableRowState } from '../../state';
import { ITable } from '../../table';
import { ITableItemController } from '../table-item/i-table-item.controller';
import { ITableController } from '../table/i-table.controller';

/**
 * 表格行数据
 *
 * @author zhanghanrui
 * @date 2024-04-16 21:04:46
 * @export
 * @interface ITableRowController
 */
export interface ITableRowController {
  /**
   * 表格控制器
   *
   * @author zhanghanrui
   * @date 2024-04-18 10:04:15
   * @type {ITableController}
   */
  table: ITableController;

  /**
   * 表格行数据，各个项的实力。key是项标识
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:00
   * @type {Record<string, ITableItemController>}
   */
  item: Record<string, ITableItemController>;

  /**
   * 表格模型
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:57
   * @type {ITable}
   */
  model: ITable;

  /**
   * 行状态
   *
   * @author zhanghanrui
   * @date 2024-04-17 13:04:17
   * @type {ITableRowState}
   */
  state: ITableRowState;

  /**
   * 当前数据主键
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:59
   * @type {string}
   */
  key: string;

  /**
   * 当前行所有数据项的key
   *
   * @author zhanghanrui
   * @date 2024-04-17 09:04:15
   * @type {string[]}
   */
  fields: string[];

  /**
   * 行数据
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:18
   * @type {IData}
   */
  data: IData;

  /**
   * 初始化
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:20
   * @return {*}  {Promise<void>}
   */
  init(): Promise<void>;

  /**
   * 数据变更
   *
   * @author zhanghanrui
   * @date 2024-04-18 10:04:52
   * @param {string} name
   * @param {*} newVal
   * @param {*} oldVal
   */
  change(name: string, newVal: any, oldVal: any): void;

  /**
   * 销毁
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:24
   * @return {*}  {Promise<void>}
   */
  destroy(): Promise<void>;

  /**
   * 行处于激活状态
   *
   * @author zhanghanrui
   * @date 2024-04-17 18:04:52
   */
  active(): void;

  /**
   * 行取消激活状态
   *
   * @author zhanghanrui
   * @date 2024-04-17 18:04:04
   */
  unActive(): void;
}
