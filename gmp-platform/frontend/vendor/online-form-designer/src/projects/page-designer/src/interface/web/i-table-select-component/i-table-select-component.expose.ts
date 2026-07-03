import { ICheckboxComponentExpose } from '../i-checkbox-component/i-checkbox-component.expose';

/**
 * 表格查询参数
 *
 * @interface IDataTableQueryDataOptions
 */
export interface ITableSelectQueryDataOptions {
  query?: Record<string, any>;
  exp?: string;
  pageNo?: number;
  pageSize?: number;
  total?: number;
  sorts?: { sortfield: string; sortType: 'asc' | 'desc' }[];
}

/**
 * 表格选择组件
 *
 * @interface ITableSelectComponentExpose
 * @extends {ICheckboxComponentExpose}
 */
export interface ITableSelectComponentExpose extends ICheckboxComponentExpose {
  /**
   * 搜索符合条件的数据
   *
   */
  search(): void;

  /**
   * 重新加载数据
   *
   * @param {ITableSelectQueryDataOptions} [queryData]
   * @return {*}  {Promise<void>}
   */
  reload(queryData?: ITableSelectQueryDataOptions): Promise<void>;
  /**
   * 通过搜索条件搜索
   * 
   * @param {any} [obj]
   */
  setValueBySearch(obj: any): void;
}
