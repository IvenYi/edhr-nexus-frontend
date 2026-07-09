import { ComputedRef, Ref } from 'vue';
import type { Emitter } from 'mitt';
import { ListTable, ListTableConstructorOptions } from '@visactor/vtable';
import { IDataVTablePagination } from '../i-data-v-table-pagination/i-data-v-table-pagination';
import { IDataVTable } from '../i-data-v-table/i-data-v-table';
import { IDataVTableQuery } from '../i-data-v-table-query/i-data-v-table-query';
import { IVTableDataItem } from '../i-v-table-data-item/i-v-table-data-item';
import { VTableCellPluginInstCache } from '../../utils';
import { IGctVTableEvent } from '../events';

/**
 * GctVTable 组件基础状态管理接口
 *
 * @export
 * @interface IGctVTableBaseStore
 */
export interface IGctVTableBaseStore {
  /**
   * 事件管理器，支持类型安全的事件处理
   *
   * @type {Emitter<IGctVTableEditEvent>}
   */
  evt: Emitter<IGctVTableEvent>;
  /**
   * 表格容器元素
   *
   * @type {(Ref<HTMLDivElement | null>)}
   */
  $el: Ref<HTMLDivElement | null>;
  /**
   * VTable 表格配置
   *
   * @type {Ref<ListTableConstructorOptions>}
   */
  options: Ref<ListTableConstructorOptions>;
  /**
   * 表格基础配置
   *
   * @type {IDataVTable}
   */
  cfg: IDataVTable;
  /**
   * 左侧固定列配置
   *
   * @type {ComputedRef<IDataVTable['columns']>}
   */
  fixedCols: ComputedRef<IDataVTable['columns']>;
  /**
   * 右侧固定列配置
   *
   * @type {ComputedRef<IDataVTable['columns']>}
   */
  fixedRightCols: ComputedRef<IDataVTable['columns']>;
  /**
   * 普通列配置
   *
   * @type {ComputedRef<IDataVTable['columns']>}
   */
  normalCols: ComputedRef<IDataVTable['columns']>;
  /**
   * 插件实例管理
   *
   * @type {VTableCellPluginInstCache}
   */
  cellPluginManager: VTableCellPluginInstCache;
  /**
   * 设置表格配置项
   *
   * @param {IDataVTable} config
   */
  setConfig(config: IDataVTable): void;
  /**
   * 表格实例
   *
   * @type {ComputedRef<ListTable>}
   */
  tableInst: ComputedRef<ListTable>;
  /**
   * 设置表格实例
   *
   * @param {ListTable} table
   */
  setTableInst(table: ListTable): void;
  /**
   * 表格画布重绘
   */
  redraw(): void;
  /**
   * 在有 v-table 表格实例后调用，进行初始化
   *
   * @returns {*}  {Promise<void>}
   */
  init(): Promise<void>;
  /**
   * 获取表格当前所有行数据
   *
   * @return {*}  {IVTableDataItem[]}
   */
  getRecords(): IVTableDataItem[];
  /**
   * 表格删除的数据
   *
   * @type {Ref<IVTableDataItem[]>}
   */
  deletedItems: Ref<IVTableDataItem[]>;
  /**
   * 选中数据
   *
   * @type {Ref<IVTableDataItem[]>}
   */
  checkedItems: Ref<IVTableDataItem[]>;
  /**
   * 表格数据总数，主要用于界面更新，现在是通过 v-table 的 api 更新数据的，导致很多时候，依据于数据量修改的界面无法自动更新
   *
   * @type {Ref<number>}
   */
  dataCount: Ref<number>;
  /**
   * 表格是否加载中
   *
   * @type {Ref<boolean>}
   */
  isLoading: Ref<boolean>;
  /**
   * 启动表格加载状态
   */
  startLoading(): void;
  /**
   * 关闭表格加载状态
   */
  endLoading(): void;
  /**
   * 表格是否还有更多数据
   *
   * @type {Ref<boolean>}
   */
  isMore: Ref<boolean>;
  /**
   * 表格是否加载更多中
   *
   * @type {Ref<boolean>}
   */
  isLoadingMore: Ref<boolean>;
  /**
   * 启动表格加载更多状态
   */
  startLoadMore(): void;
  /**
   * 关闭表格加载更多状态
   */
  endLoadMore(): void;
  /**
   * 分页信息
   *
   * @type {Ref<IDataVTablePagination>}
   */
  pagination: Ref<IDataVTablePagination>;
  /**
   * 加载更多模式下请求
   *
   * @returns {*}  {Promise<void>}
   */
  loadMore(query?: Partial<IDataVTableQuery>): Promise<void>;
  /**
   * 加载表格数据
   *
   * @returns {*}  {Promise<void>}
   */
  loadData(query?: Partial<IDataVTableQuery>): Promise<void>;
  /**
   * 触发表格搜索
   *
   * @returns {*}  {Promise<void>}
   */
  search(query?: Partial<IDataVTableQuery>): Promise<void>;
  /**
   * 手动设置表格数据(会破坏自动加载分页逻辑)
   *
   * @param {IVTableDataItem[]} data
   */
  setItems(data: IVTableDataItem[]): void;
  /**
   * 手动添加表格数据(会破坏自动加载分页逻辑)
   *
   * @param {IVTableDataItem[]} data
   */
  addItems(data: IVTableDataItem[]): void;
  /**
   * 更新表格数据，根据行主键进行匹配，不存在于表格的数据，则跳过
   *
   * @param {IVTableDataItem[]} rows
   */
  updateItems(rows: IVTableDataItem[]): void;
  /**
   * 删除表格数据，根据行主键进行匹配，不存在于表格的数据，则跳过，只基于标识删除
   *
   * @param {IVTableDataItem[]} rows
   */
  removeItems(rows: IVTableDataItem[]): void;
  /**
   * 获取表格配置的原始数据，根据配置的表格列进行字段过滤, + 返回 id
   *
   * @return {*}  {IObject[]}
   */
  getSourceItems(): IObject[];
  /**
   * 获取表格删除的原始数据，根据配置的表格列进行字段过滤, + 返回 id，+ 删除标识
   *
   * @return {*}  {IObject[]}
   */
  getRemovedSourceItems(): IObject[];
  /**
   * 选中单行数据，若已选中则取消选中。checked 指定时，按照指定设置
   *
   * @param {IVTableDataItem} item
   * @param {boolean} [checked] 指定设置选中状态
   */
  checkRow(item: IVTableDataItem, checked?: boolean): void;
  /**
   * 单行选中模式下，选中某一行数据。checked 指定时，按照指定设置
   *
   * @param {IVTableDataItem} item
   * @param {boolean} [checked] 指定设置选中状态
   */
  singleRowCheck(item: IVTableDataItem, checked?: boolean): void;
  /**
   * 选中所有数据
   */
  checkAll(): void;
  /**
   * 清空所有选中数据
   */
  uncheckAll(): void;
  /**
   * 获取选中的行数据
   *
   * @returns {*}  {IVTableDataItem[]}
   */
  getCheckedRows(): IVTableDataItem[];
}
