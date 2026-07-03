// 旧 API 的类型申明，单独抽离放这里

/**
 *
 * @private
 */
export interface ICondition {
  query?: object;
  exp?: string;
  sorts?: Array<{ sortField: string; sortType: 'desc' | 'asc' }>;
}

/**
 *
 * @private
 */
export interface IConditionPagination extends ICondition {
  pageNo: number;
  pageSize: Number;
}

/**
 *
 * @private
 */
export interface IRdoCondition {
  keyword?: string;
  sorts?: Array<{ sortField: string; sortType: string }>;
}

/**
 *
 * @private
 */
export interface IRdoConditionPagination extends IRdoCondition {
  pageNo: number;
  pageSize: Number;
}

/**
 *
 * @private
 */
export interface IPaginationResponse<T> {
  data: Array<T>;
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalCount: number;
}

/**
 *
 * @private
 */
export type SystemFields =
  | 'create_time_'
  | 'create_user_id_'
  | 'create_user_name_'
  | 'modify_time_'
  | 'modify_user_id_'
  | 'modify_user_name_';

/**
 *
 * @private
 */
export type IModelDataSubmit<T> = Partial<Omit<T, SystemFields>>;

/**
 *
 * @deprecated
 * @hidden
 * @interface JsEngine
 */
export interface JsEngine {
  /**
   * 执行JS脚本（key 可以是脚本的key也可以是服务编排的key,params 是需要执行脚本需要的传参）
   * @param key
   * @param params
   */
  execute(key: string, params: object);
}

/**
 *
 * @deprecated
 * @hidden
 * @interface EventPublisher
 */
export interface EventPublisher {
  /**
   * 发布事件
   * @param key
   * @param params
   */
  publish(key: string, params: object);
}

/**
 *
 * @deprecated
 * @hidden
 * @interface SystemVar
 */
export interface SystemVar {
  /**
   * 获取系统变量值（根据当前环境自动返回设置的环境变量值）
   * @param key
   */
  getVarByKey(key: string): string;
}
