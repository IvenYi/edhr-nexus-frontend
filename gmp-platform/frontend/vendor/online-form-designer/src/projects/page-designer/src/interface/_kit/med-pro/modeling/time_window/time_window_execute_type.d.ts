/**
 *模型名称：时间窗执行类型
 *模型KEY:enu_time_window_execute_type
 */
interface TimeWindowExecuteType{
  /**
   * 不允许执行结束事务， 并且不执行处置操作
   *
   * @author zyl
   * @type {string}
   */
notExecuteEndTxn: string,


  /**
   * 允许执行结束事务， 并且执行所有已定义的处置操作
   *
   * @author zyl
   * @type {string}
   */
executeEndTxn: string,


  /**
   * 允许使用电子签名执行结束事务
   *
   * @author zyl
   * @type {string}
   */
needSignRequirement: string,


}
