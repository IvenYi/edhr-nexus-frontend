import { IDataVTableQuery } from '../i-data-v-table-query/i-data-v-table-query';
import { IVTableDataItem } from '../i-v-table-data-item/i-v-table-data-item';

/**
 * GctVTable 组件对外暴露接口
 *
 * @export
 * @interface IGctVTableExpose
 */
export interface IGctVTableExpose {
  /**
   * 触发检索模式
   *
   * @param {Partial<IDataVTableQuery>} [query]
   * @returns {*}  {Promise<void>}
   */
  search(query?: Partial<IDataVTableQuery>): Promise<void>;

  /**
   * 选中所有行
   */
  checkAll(): void;

  /**
   * 取消所有选中
   */
  uncheckAll(): void;

  /**
   * 获取当前选中数据
   *
   * @returns {*}  {IVTableDataItem[]}
   */
  getCheckedRows(): IVTableDataItem[];

  /**
   * 新增数据行
   *
   * @param {IVTableDataItem[]} items
   */
  addItems(items: IVTableDataItem[]): void;

  /**
   * 设置表格数据，会覆盖现有数据
   *
   * @param {IVTableDataItem[]} items
   */
  setItems(items: IVTableDataItem[]): void;

  /**
   * 更新表格数据，根据行主键进行匹配，不存在的数据则跳过
   *
   * @param {IVTableDataItem[]} rows
   */
  updateItems(rows: IVTableDataItem[]): void;

  /**
   * 删除表格数据，根据行主键进行匹配，不存在的数据则跳过, 只基于标识删除
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
   * 获取当前表格数据
   *
   * @return {*}  {IVTableDataItem[]}
   */
  getItems(): IVTableDataItem[];

  /**
   * 获取当前表格删除的数据
   *
   * @return {*}  {IVTableDataItem[]}
   */
  getRemovedItems(): IVTableDataItem[];

  /**
   * 表格重绘
   */
  redraw(): void;

  /**
   * 重新设置表格配置
   */
  resetConfig(): void;
}
