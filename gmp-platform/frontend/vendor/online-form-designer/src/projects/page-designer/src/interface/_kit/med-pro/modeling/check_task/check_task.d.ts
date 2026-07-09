import {CommonFields } from '../parent'

interface CheckTask extends CommonFields {
  /**
   * 工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
workflow_id_: string,


  /**
   * 检验人员
   *
   * @author zyl
   * @type {string}
   */
inspectors_: string,


  /**
   * 完成时间
   *
   * @author zyl
   * @type {Date}
   */
complete_time_: Date,


  /**
   * 创建类型
   *
   * @author zyl
   * @see {CheckTaskCreateType}
   * @type {string}
   */
create_type_: string,


  /**
   * 数据采集历史项
   *
   * @author zyl
   * @see {DataCollectionItemHistory}
   * @type {string}
   */
data_collection_entries_: string,


  /**
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * 采集方式
   *
   * @author zyl
   * @see {ChecklistCollectionMethod}
   * @type {string}
   */
collection_method_: string,


  /**
   * 在线表单模版
   *
   * @author zyl
   * @type {string}
   */
online_form_tmpl_id_: string,


  /**
   * 在线表单
   *
   * @author zyl
   * @type {string}
   */
online_form_id_: string,


  /**
   * 检验结果
   *
   * @author zyl
   * @see {CheckTaskResult}
   * @type {string}
   */
check_result_: string,


  /**
   * 当前节点
   *
   * @author zyl
   * @type {string}
   */
current_node_name_: string,


  /**
   * 业务流实例Id
   *
   * @author zyl
   * @type {string}
   */
biz_process_instance_id_: string,


  /**
   * 服务任务Id
   *
   * @author zyl
   * @type {string}
   */
service_task_act_id_: string,


  /**
   * 接受任务Id
   *
   * @author zyl
   * @type {string}
   */
receive_task_act_id_: string,


  /**
   * 描述
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 检验单状态
   *
   * @author zyl
   * @see {CheckTaskStatus}
   * @type {string}
   */
status_: string,


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
   * 检验单名称
   *
   * @author zyl
   * @type {string}
   */
checklist_name_: string,


  /**
   * 检验单
   *
   * @author zyl
   * @see {Checklist}
   * @type {string}
   */
checklist_id_: string,


  /**
   * 检验单类型
   *
   * @author zyl
   * @see {CheckTaskType}
   * @type {string}
   */
type_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 无视校验
   *
   * @author zyl
   * @type {boolean}
   */
validate_ignore_: boolean,


}


/**
 *模型名称：检验任务
 *模型KEY:em_check_task
 */
interface CheckTaskMethods extends IModelService<CheckTask> {
  /**
   * 创建表单默认参数
   *
   * @param1 releaseTaskId 放行任务id
   * @return Object
   */
makeFormDefaultParams(releaseTaskId:string):Object;


  /**
   * 匹配检验单应用规则
   *
   * @param1 productId 产品id
   * @return MaterialUsageRule
   */
match(productId:string):MaterialUsageRule;


  /**
   * 触发检验任务
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 txnKey 事务key
   * @return void
   */
trigger(containerId:string,workflowStepId:string,txnKey:string):void;


  /**
   * 更新检验单校验过状态
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
updateValidateIgnore(containerId:string,workflowStepId:string):void;


}
