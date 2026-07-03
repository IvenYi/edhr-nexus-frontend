/**
 *模型名称：工单类型
 *模型KEY:enu_mfg_order_type
 */
interface MfgOrderType{
  /**
   * 成品工单
   *
   * @author zyl
   * @type {string}
   */
finished: string,


  /**
   * 半成品工单
   *
   * @author zyl
   * @type {string}
   */
semiFinished: string,


  /**
   * 返工工单
   *
   * @author zyl
   * @type {string}
   */
rework: string,


}
