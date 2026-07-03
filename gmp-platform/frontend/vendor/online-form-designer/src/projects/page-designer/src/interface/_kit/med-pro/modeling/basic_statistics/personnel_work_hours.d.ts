import {CommonFields } from '../parent'

interface PersonnelWorkHours extends CommonFields {
  /**
   * 工步别名
   *
   * @author zyl
   * @type {string}
   */
workflow_step_alias_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 报工人
   *
   * @author zyl
   * @type {string}
   */
user_id_: string,


  /**
   * 开工时间
   *
   * @author zyl
   * @type {Date}
   */
production_start_time_: Date,


  /**
   * 完工时间
   *
   * @author zyl
   * @type {Date}
   */
production_end_time_: Date,


  /**
   * 暂停时长
   *
   * @author zyl
   * @type {number}
   */
suspend_duration_: number,


  /**
   * 搁置时长
   *
   * @author zyl
   * @type {number}
   */
hold_duration_: number,


  /**
   * 关闭时长
   *
   * @author zyl
   * @type {number}
   */
close_duration_: number,


  /**
   * 实际工时
   *
   * @author zyl
   * @type {number}
   */
actual_work_hours_: number,


  /**
   * 标准工时
   *
   * @author zyl
   * @type {number}
   */
standard_work_hours_: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：人员工时统计
 *模型KEY:em_personnel_work_hours
 */
interface PersonnelWorkHoursMethods extends IModelService<PersonnelWorkHours> {
}
