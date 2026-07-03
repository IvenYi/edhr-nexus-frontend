import { QXEvent } from 'qx-util';
import { ITableEditorProvider } from '../../provider';
import { ITableState } from '../../state';
import { ITable } from '../../table';
import { ITableRowController } from '../table-row/i-table-row.controller';
import { ITableEvent } from '../../events';

/**
 * 表格控制器
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:43
 * @export
 * @interface ITableController
 */
export interface ITableController {
  /**
   * 表格事件
   *
   * @author zhanghanrui
   * @date 2024-04-18 10:04:04
   * @type {QXEvent<ITableEvent>}
   */
  readonly evt: QXEvent<ITableEvent>;

  /**
   * 表格模型
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:52
   * @type {ITable}
   */
  model: ITable;

  /**
   * 界面状态（驱动界面呈现）
   *
   * @author zhanghanrui
   * @date 2024-04-16 10:04:54
   * @type {ITableState}
   */
  state: ITableState;

  /**
   * 当前数据行控制器
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:50
   * @type {Record<string, ITableRowController>}
   */
  row: Record<string, ITableRowController>;

  /**
   * 编辑器适配器清单
   *
   * @author zhanghanrui
   * @date 2024-04-17 11:04:44
   * @type {Record<string, ITableEditorProvider>}
   */
  editorProviders: Record<string, ITableEditorProvider>;

  /**
   * 手动设置 table 数据
   *
   * @author zhanghanrui
   * @date 2024-04-17 10:04:23
   * @param {IData[]} items
   */
  setData(items: IData[]): void;

  /**
   * 获取当前表格数据
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:05
   * @return {*}  {IData[]}
   */
  getData(): IData[];

  /**
   * 数据变更
   *
   * @author zhanghanrui
   * @date 2024-04-18 10:04:44
   * @param {ITableRowController} row
   * @param {string} name
   * @param {*} newVal
   * @param {*} oldVal
   */
  change(row: ITableRowController, name: string, newVal: any, oldVal: any): void;

  /**
   * 加载数据
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:51
   * @return {*}  {Promise<void>}
   */
  load(params?: IParams): Promise<void>;

  /**
   * 重新加载数据，会跳转到第一页
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:14
   * @return {*}  {Promise<void>}
   */
  reload(params?: IParams): Promise<void>;

  /**
   * 会触发重新加载并携带上搜索条件，会跳转到第一页
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:42
   * @return {*}  {Promise<void>}
   */
  search(params?: IParams): Promise<void>;

  /**
   * 刷新当前页数据
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:44
   * @return {*}  {Promise<void>}
   */
  refresh(params?: IParams): Promise<void>;

  /**
   * 销毁
   *
   * @author zhanghanrui
   * @date 2024-04-16 21:04:51
   */
  destroy(): void;

  /**
   * 更新分页相关数据
   * @author lingxiaoming
   * @date 2024-07-13 10:09:51
   * @param {{ total?: number; size?: number; page?: number }} data
   */
  updatePagination(data: { total?: number; size?: number; page?: number }): void;
}
