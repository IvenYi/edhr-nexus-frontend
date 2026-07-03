/**
 * 表格事件
 *
 * @author zhanghanrui
 * @date 2024-04-18 10:04:10
 * @export
 * @interface ITableEvent
 */
export interface ITableEvent {
  /**
   * 表格行数据变更
   *
   * @author zhanghanrui
   * @date 2024-04-18 10:04:47
   * @param {IData} data 行数据
   * @param {string} key 变更数据标识
   * @param {*} value 新值
   * @param {*} oldValue 旧值
   */
  change(data: IData, key: string, value: any, oldValue: any): void;
}
