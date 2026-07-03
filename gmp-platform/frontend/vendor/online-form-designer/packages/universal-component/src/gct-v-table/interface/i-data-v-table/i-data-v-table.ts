import { IDataVTableQuery } from '../i-data-v-table-query/i-data-v-table-query';
import type { IVTableColumn } from '../i-v-table-column/i-v-table-column';
import type { IVTableEditColumn } from '../i-v-table-column/i-v-table-edit-column';
import type { IVTableOperationColumn } from '../i-v-table-column/i-v-table-operation-column';
import { IDataVTablePipe } from '../pipe';
import { IDataVTableStyle } from '../i-data-v-table-style/i-data-v-table-style';

/**
 * 数据表格配置
 *
 * @author chitanda
 * @date 2025-11-08 15:11:02
 * @export
 * @interface IDataVTable
 */
export interface IDataVTable {
  /**
   * 表格选择模式
   *
   * @default none
   * @type {('single' | 'multiple' | 'none')}
   */
  checkMode?: 'single' | 'multiple' | 'none';
  /**
   * 分页模式
   *
   * @default scroll
   * @type {('pagination' | 'scroll' | 'none')} 标准分页 / 滚动加载 / 不分页
   */
  pageMode?: 'pagination' | 'scroll' | 'none';
  /**
   * 分页大小
   *
   * @default 20
   * @type {number}
   */
  pageSize?: number;
  /**
   * 是否显示序号
   *
   * @default false
   * @type {boolean}
   */
  isSerialNumber?: boolean;
  /**
   * 是否启用拖拽排序，开启后会自动启用显示序号，并且无分页且无筛选排序等数据处理功能时可用
   *
   * @type {boolean}
   */
  isDragSort?: boolean;
  /**
   * 空数据时是否显示提示文本
   *
   * @author chitanda
   * @date 2025-11-08 15:11:38
   * @type {boolean}
   */
  isEmptyText?: boolean;
  /**
   * 是否自动加载
   * 默认值: 非本地模式下默认自动加载，本地模式下默认不自动加载
   *
   * @author chitanda
   * @date 2025-11-08 15:11:52
   * @type {boolean}
   */
  autoLoad?: boolean;
  /**
   * 滚动加载阈值，距离底部多少距离时触发加载更多
   *
   * @default 30
   * @type {number}
   */
  threshold?: number;
  /**
   * 行数据主键标识
   *
   * @author chitanda
   * @date 2025-11-08 15:11:45
   * @type {string}
   */
  key: string;
  /**
   * 表格整体只读
   *
   * @type {boolean}
   */
  readonly?: boolean;
  /**
   * 表格整体禁用
   *
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * 操作列
   *
   * @author chitanda
   * @date 2025-11-08 15:11:59
   * @type {((IVTableColumn | IVTableEditColumn | IVTableOperationColumn)[])}
   */
  columns: (IVTableColumn | IVTableEditColumn | IVTableOperationColumn)[];
  /**
   * 表格样式配置
   *
   * @type {IDataVTableStyle}
   */
  style?: IDataVTableStyle;
  /**
   * 表格管道函数
   *
   * @type {IDataVTablePipe}
   */
  pipe?: IDataVTablePipe;
  /**
   * 有 VTable 实例后调用
   *
   * @returns {*}  {Promise<void>}
   */
  init?(): Promise<void>;
  /**
   * 加载表格数据
   *
   * @param {Partial<IDataVTableQuery>} query
   * @returns {*}  {Promise<{ items: any[]; total: number }>}
   */
  load(query: Partial<IDataVTableQuery>): Promise<{ items: any[]; total: number }>;
  /**
   * 行编辑保存方法
   *
   * @param {IObject} data
   * @return {*}  {Promise<boolean>}
   */
  save?(data: IObject): Promise<boolean>;
}
