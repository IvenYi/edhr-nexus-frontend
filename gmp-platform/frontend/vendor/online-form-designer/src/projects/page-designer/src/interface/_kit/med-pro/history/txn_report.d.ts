import {CommonFields, ExecuteParams } from '../parent'

interface TxnReport extends CommonFields {
  /**
   * 报工数
   *
   * @author zyl
   * @type {number}
   */
report_qty_: number,


  /**
   * 事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 事务主体ID
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 报工人员
   *
   * @author zyl
   * @type {string}
   */
report_user_ids_: string,


  /**
   * 工步别名
   *
   * @author zyl
   * @type {string}
   */
workflow_step_alias_id_: string,


  /**
   * 报工详情
   *
   * @author zyl
   * @see {TxnReportEntry}
   * @type {string}
   */
entries_: string,


  /**
   * 多人报工
   *
   * @author zyl
   * @type {boolean}
   */
report_multiple_: boolean,


}


/**
 *模型名称：报工
 *模型KEY:em_txn_report
 */
interface TxnReportMethods extends IModelService<TxnReport> {
  /**
   * 当前工步
   *
   * @param1 containerId 批次id
   * @return WorkflowStep[]
   */
currentWorkflowSteps(containerId:string):WorkflowStep[];


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 验证是否超报工
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 reportQty 本次报工数量
   * @return void
   */
validateOverReport(containerId:string,workflowStepId:string,reportQty:number):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
