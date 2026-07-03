/**
 *模型名称：检验单类型
 *模型KEY:enu_check_task_type
 */
interface CheckTaskType{
  /**
   * 首检
   *
   * @author zyl
   * @type {string}
   */
firstCheck: string,


  /**
   * 过程检
   *
   * @author zyl
   * @type {string}
   */
processCheck: string,


  /**
   * 成品检
   *
   * @author zyl
   * @type {string}
   */
finishedProductCheck: string,


  /**
   * 维修
   *
   * @author zyl
   * @type {string}
   */
overhaul: string,


  /**
   * 异常处理
   *
   * @author zyl
   * @type {string}
   */
errorHandle: string,


  /**
   * 不合格评审
   *
   * @author zyl
   * @type {string}
   */
unqualified: string,


  /**
   * 返工
   *
   * @author zyl
   * @type {string}
   */
rework: string,


}
