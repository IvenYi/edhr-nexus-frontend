/**
 *模型名称：预约搁置状态
 *模型KEY:enu_reservation_hold_status
 */
interface ReservationHoldStatus{
  /**
   * 未执行
   *
   * @author zyl
   * @type {string}
   */
unExecuted: string,


  /**
   * 已执行
   *
   * @author zyl
   * @type {string}
   */
executed: string,


  /**
   * 已失败
   *
   * @author zyl
   * @type {string}
   */
failed: string,


  /**
   * 已取消
   *
   * @author zyl
   * @type {string}
   */
canceled: string,


}
