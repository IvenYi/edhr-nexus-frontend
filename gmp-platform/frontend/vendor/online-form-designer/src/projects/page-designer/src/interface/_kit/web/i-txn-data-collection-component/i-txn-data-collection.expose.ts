/**
 * @interface ITxnDataCollectionComponentExpose
 */

export interface ITxnDataCollectionComponentExpose {
  /**
   * 返回数据采集输入数据
   * @return {Array<object>}
   */
  getValue(): Array<object>;

  /**
   *
   * @param {Array<object>} value
   * @param {number?} index index存在时设置的是当前某一个数据采集的配置项，否则重置所有
   */
  setValue(value: Array<object>, index?: number): void;

  /**
   * 数据采集关联数据清空
   */
  reset(): void;

  /**
   * 重栽数据采集配置数据
   */
  reload(): void;

  /**
   * 设置数据采集完整配置
   * @param { data: Array<object>, dict: object } res
   */
  setDataSource(res: { data: Array<object>; dict: object }): void;

  /**
   * 异步函数校验数据采集配置项
   * @return {Promise<void>}
   */
  validate(): Promise<void>;

  /**
   * 返回当前数据采集暂存唯一标识
   * @return {string}
   */
  getStashKey(): string;

  /**
   * 设置事务参数key
   * @param {string} key 设置查询事务key
   */
  setTxnKey(key: string): void;
}
