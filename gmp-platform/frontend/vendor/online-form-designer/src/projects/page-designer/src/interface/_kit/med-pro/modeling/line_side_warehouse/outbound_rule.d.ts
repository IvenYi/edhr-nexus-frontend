/**
 *模型名称：出库规则
 *模型KEY:enu_outbound_rule
 */
interface OutboundRule{
  /**
   * 先进先出
   *
   * @author zyl
   * @type {string}
   */
fifo: string,


  /**
   * 后进先出
   *
   * @author zyl
   * @type {string}
   */
lifo: string,


  /**
   * 临期先出
   *
   * @author zyl
   * @type {string}
   */
fefo: string,


}
