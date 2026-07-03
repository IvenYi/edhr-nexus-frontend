import {CommonFields } from '../parent'

interface WorkflowStepExecution extends CommonFields {
  /**
   * 批次
   *
   * @author zyl
   * @type {string}
   */
container_id_: string,


  /**
   * 分支执行
   *
   * @author zyl
   * @type {string}
   */
execution_id_: string,


  /**
   * 分支ID
   *
   * @author zyl
   * @type {string}
   */
branch_id_: string,


  /**
   * 生产状态
   *
   * @author zyl
   * @type {number}
   */
in_process_: number,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 工站
   *
   * @author zyl
   * @see {Operation}
   * @type {string}
   */
operation_id_: string,


  /**
   * 允许报工
   *
   * @author zyl
   * @type {boolean}
   */
report_enabled_: boolean,


  /**
   * 是否暂停
   *
   * @author zyl
   * @type {boolean}
   */
suspend_: boolean,


}


/**
 *模型名称：工艺步骤执行记录
 *模型KEY:em_workflow_step_execution
 */
interface WorkflowStepExecutionMethods extends IModelService<WorkflowStepExecution> {
  /**
   * 标记是否可报工
   *
   * @param1 containerId 批次id
   * @return void
   */
markReportEnabled(containerId:string):void;


}
