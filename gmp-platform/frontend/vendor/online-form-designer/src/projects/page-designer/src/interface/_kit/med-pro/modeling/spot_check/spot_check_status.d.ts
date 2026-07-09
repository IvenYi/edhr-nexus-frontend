/**
 *模型名称：点检状态枚举类型
 *模型KEY:enu_spot_check_status
 */
interface SpotCheckStatus{
  /**
   * 已超期
   *
   * @author zyl
   * @type {string}
   */
overdue: string,


  /**
   * 预警期
   *
   * @author zyl
   * @type {string}
   */
warning: string,


  /**
   * 已到期
   *
   * @author zyl
   * @type {string}
   */
due: string,


  /**
   * 未到期
   *
   * @author zyl
   * @type {string}
   */
undue: string,


}
