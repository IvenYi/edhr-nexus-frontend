import {CommonFields } from '../parent'

interface OnDutyHistory extends CommonFields {
  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 离岗原因
   *
   * @author zyl
   * @see {OffDutyReason}
   * @type {string}
   */
off_duty_reason_id_: string,


  /**
   * 人员
   *
   * @author zyl
   * @type {string}
   */
user_id_: string,


  /**
   * 上岗时间
   *
   * @author zyl
   * @type {Date}
   */
on_duty_time_: Date,


  /**
   * 离岗时间
   *
   * @author zyl
   * @type {Date}
   */
off_duty_time_: Date,


}


/**
 *模型名称：上岗离岗记录
 *模型KEY:em_on_duty_history
 */
interface OnDutyHistoryMethods extends IModelService<OnDutyHistory> {
  /**
   * 人员是否有上岗记录
   *
   * @param 
   * @return void
   */
userIsOnDuty():void;


}
