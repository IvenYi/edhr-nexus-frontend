import {CommonFields } from '../parent'

interface TimeWindow extends CommonFields {
  /**
   * 大于最大时间签名需求
   *
   * @author zyl
   * @see {SignRequirement}
   * @type {string}
   */
max_sign_requirement_id_: string,


  /**
   * 小于最小时间签名需求
   *
   * @author zyl
   * @see {SignRequirement}
   * @type {string}
   */
min_sign_requirement_id_: string,


  /**
   * 开始工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
start_spec_id_: string,


  /**
   * 开始时间窗事务
   *
   * @author zyl
   * @see {TimeWindowTxnType}
   * @type {string}
   */
start_txn_key_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 小于最小时间搁置原因
   *
   * @author zyl
   * @see {ContainerHoldReason}
   * @type {string}
   */
min_hold_reason_id_: string,


  /**
   * 小于最小时间指定工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
min_specification_workflow_step_id_: string,


  /**
   * 大于最大时间选择类型
   *
   * @author zyl
   * @see {TimeWindowExecuteType}
   * @type {string}
   */
max_type_: string,


  /**
   * 大于最大时间返工原因
   *
   * @author zyl
   * @see {ReworkReason}
   * @type {string}
   */
max_rework_reason_id_: string,


  /**
   * 大于最大时间跳站指定工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
max_specification_workflow_id_: string,


  /**
   * 大于最大时间指定工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
max_specification_workflow_step_id_: string,


  /**
   * 大于最大时间搁置原因
   *
   * @author zyl
   * @see {ContainerHoldReason}
   * @type {string}
   */
max_hold_reason_id_: string,


  /**
   * 小于最小时间选择类型
   *
   * @author zyl
   * @see {TimeWindowExecuteType}
   * @type {string}
   */
min_type_: string,


  /**
   * 结束工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
end_spec_id_: string,


  /**
   * 时间类型
   *
   * @author zyl
   * @see {TimeWindowTimeType}
   * @type {string}
   */
time_type_: string,


  /**
   * 最小时间
   *
   * @author zyl
   * @type {number}
   */
min_time_: number,


  /**
   * 最大时间
   *
   * @author zyl
   * @type {number}
   */
max_time_: number,


  /**
   * 结束时间窗事务
   *
   * @author zyl
   * @see {TimeWindowTxnType}
   * @type {string}
   */
end_txn_key_: string,


  /**
   * 小于最小时间返工原因
   *
   * @author zyl
   * @see {ReworkReason}
   * @type {string}
   */
min_rework_reason_id_: string,


  /**
   * 小于最小时间跳站指定工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
min_specification_workflow_id_: string,


  /**
   * 是否历史数据
   *
   * @author zyl
   * @type {boolean}
   */
history_: boolean,


  /**
   * 大于最大时间返工
   *
   * @author zyl
   * @type {boolean}
   */
max_need_rework_: boolean,


  /**
   * 小于最小时间搁置
   *
   * @author zyl
   * @type {boolean}
   */
min_need_hold_: boolean,


  /**
   * 大于最大时间跳站
   *
   * @author zyl
   * @type {boolean}
   */
max_need_move_non_std_: boolean,


  /**
   * 大于最大时间搁置
   *
   * @author zyl
   * @type {boolean}
   */
max_need_hold_: boolean,


  /**
   * 小于最小时间返工
   *
   * @author zyl
   * @type {boolean}
   */
min_need_rework_: boolean,


  /**
   * 小于最小时间跳站
   *
   * @author zyl
   * @type {boolean}
   */
min_need_move_non_std_: boolean,


}


/**
 *模型名称：时间窗设置
 *模型KEY:em_time_window
 */
interface TimeWindowMethods extends IModelService<TimeWindow> {
  /**
   * 触发时间窗计时
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 txnKey 事务key
   * @return void
   */
trigger(containerId:string,workflowStepId:string,txnKey:string):void;


}
