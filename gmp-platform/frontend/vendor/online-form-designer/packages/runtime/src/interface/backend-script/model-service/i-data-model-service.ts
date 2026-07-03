/**
 * 数据模型服务
 *
 * @interface IDataModelService
 */
export interface IDataModelService {
  /**
   *
   *
   * @returns {*}  {Map<string, string[]>} <数据模型字段key, 原字段key数组>
   */
  mapTo(): Map<string, string[]>;
}
