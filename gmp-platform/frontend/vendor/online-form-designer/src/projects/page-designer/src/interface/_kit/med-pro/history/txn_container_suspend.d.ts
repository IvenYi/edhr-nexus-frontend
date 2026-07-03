import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerSuspend extends CommonFields {
  /**
   * 事务总线
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 事务主体
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 暂停前状态
   *
   * @author zyl
   * @see {ContainerStatus}
   * @type {string}
   */
ahead_status_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 批次暂停原因
   *
   * @author zyl
   * @see {SuspendReason}
   * @type {string}
   */
f_suspend_reason_id_r6df: string,


  /**
   * 耗时
   *
   * @author zyl
   * @type {number}
   */
duration_: number,


  /**
   * 启动时间
   *
   * @author zyl
   * @type {Date}
   */
restore_time_: Date,


}


/**
 *模型名称：批次暂停事务
 *模型KEY:em_txn_container_suspend
 */
interface TxnContainerSuspendMethods extends IModelService<TxnContainerSuspend> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 返回暂停的批次
   *
   * @param1 containerIds 批次id数组
   * @param2 workflowStepIds 工步id数组
   * @return string[]
   */
getSuspend(containerIds:string[],workflowStepIds:string[]):string[];


  /**
   * 是否有暂停工步
   *
   * @param1 containerId 批次id
   * @return boolean
   */
hasSuspendWorkflowSteps(containerId:string):boolean;


  /**
   * 工步是否被暂停
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return boolean
   */
isSuspend(containerId:string,workflowStepId:string):boolean;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
