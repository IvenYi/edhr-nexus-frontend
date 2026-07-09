/**
 * 工艺参数卡组件
 * @interface IProcessParameterCardComponentExpose
 */
export interface IData {
  tableData: Object[];
  parameterData: Object[];
}

export interface IProcessParameterCardComponentExpose {
  /**
   * 获取工艺参数卡数据
   * @return {IData}
   */
  getValue(): IData;

  /**
   * 重置工艺参数卡
   */
  reset(): void;

  /**
   * 重载数据
   * @async
   * @return {Promise}
   */
  reload(): Promise<void>;
}