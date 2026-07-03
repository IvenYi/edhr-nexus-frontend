/**
 *模型名称：时间窗结束事务类型
 *模型KEY:enu_time_window_end_txn_type
 */
interface TimeWindowEndTxnType{
  /**
   * 进站
   *
   * @author zyl
   * @type {string}
   */
em_txn_move_in: string,


  /**
   * 出站
   *
   * @author zyl
   * @type {string}
   */
em_txn_move: string,


  /**
   * 批次合并
   *
   * @author zyl
   * @type {string}
   */
em_txn_container_combine: string,


  /**
   * 批次关联
   *
   * @author zyl
   * @type {string}
   */
em_txn_container_association: string,


}
