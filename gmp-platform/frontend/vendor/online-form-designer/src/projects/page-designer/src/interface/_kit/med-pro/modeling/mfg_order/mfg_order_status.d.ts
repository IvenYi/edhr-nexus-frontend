/**
 *模型名称：工单状态
 *模型KEY:enu_mfg_order_status
 */
interface MfgOrderStatus{
  /**
   * 已完成
   *
   * @author zyl
   * @type {string}
   */
finished: string,


  /**
   * 未开始
   *
   * @author zyl
   * @type {string}
   */
waiting: string,


  /**
   * 已排产
   *
   * @author zyl
   * @type {string}
   */
scheduled: string,


  /**
   * 生产中
   *
   * @author zyl
   * @type {string}
   */
unfinished: string,


  /**
   * 已投产
   *
   * @author zyl
   * @type {string}
   */
dispatched: string,


}
