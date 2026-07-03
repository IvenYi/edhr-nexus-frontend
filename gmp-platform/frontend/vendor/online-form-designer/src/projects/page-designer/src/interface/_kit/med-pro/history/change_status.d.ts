/**
 *模型名称：数采变更状态
 *模型KEY:enu_change_status
 */
interface ChangeStatus{
  /**
   * 已完成
   *
   * @author zyl
   * @type {string}
   */
finished: string,


  /**
   * 审核中
   *
   * @author zyl
   * @type {string}
   */
audit: string,


  /**
   * 未开始
   *
   * @author zyl
   * @type {string}
   */
waiting: string,


  /**
   * 驳回
   *
   * @author zyl
   * @type {string}
   */
reject: string,


}
