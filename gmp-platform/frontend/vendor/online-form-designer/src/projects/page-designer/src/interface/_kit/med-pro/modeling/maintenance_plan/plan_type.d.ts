/**
 *模型名称：保养计划类型
 *模型KEY:enu_plan_type
 */
interface PlanType{
  /**
   * 周期保养
   *
   * @author zyl
   * @type {string}
   */
cycle: string,


  /**
   * 次数保养
   *
   * @author zyl
   * @type {string}
   */
times: string,


  /**
   * 固定日期保养
   *
   * @author zyl
   * @type {string}
   */
fixed: string,


  /**
   * 产量保养
   *
   * @author zyl
   * @type {string}
   */
throughput: string,


}
