import { ITableController } from '../controller';
import { IPagination } from './i-pagination';
import { ITableItem } from './i-table-item';

/**
 * 表单
 *
 * @author zhanghanrui
 * @date 2024-04-15 17:04:39
 * @export
 * @interface ITable
 */
export interface ITable {
  /**
   * 是否为本地模式，本地模式下不进行数据加载。默认为 false
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-17 10:04:09
   * @type {boolean}
   */
  local?: boolean;

  /**
   * 行编辑模式
   *
   * @author chitanda
   * @date 2025-07-07 09:07:49
   * @type {('row' | 'all')} 单行(hover/active)行编辑模式 | 全表格编辑模式
   */
  rowEditMode?: 'row' | 'all';

  /**
   * 空数据时是否显示提示文本
   *
   * @type {boolean}
   */
  isEmptyText?: boolean;

  /**
   * 是否自动加载，非本地模式下默认自动加载，本地模式下不自动加载
   *
   * @author zhanghanrui
   * @date 2024-04-17 10:04:53
   * @type {boolean}
   */
  autoLoad?: boolean;

  /**
   * 行数据主键标识
   *
   * @author zhanghanrui
   * @date 2024-04-17 10:04:36
   * @type {string}
   */
  key: string;

  /**
   * 表格列
   *
   * @author zhanghanrui
   * @date 2024-04-15 17:04:00
   * @type {ITableItem[]}
   */
  columns: ITableItem[];

  /**
   * 分页模型
   * @author lingxiaoming
   * @date 2024-07-13 09:53:34
   * @type {IPagination}
   */
  pagination?: IPagination;

  /**
   * 获取当前页面数据
   *
   * @author zhanghanrui
   * @date 2024-04-16 10:04:27
   * @param {IParams} [params]
   * @return {*}  {Promise<IData[]>}
   */
  fetch?(params?: IParams, controller?: ITableController): Promise<IData[]>;
}
