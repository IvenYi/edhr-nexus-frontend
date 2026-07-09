import {CommonFields, ExecuteParams } from '../parent'

interface TxnCleaning extends CommonFields {
  /**
   * 事务总线
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
   * 事务key
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 是否进站清场
   *
   * @author zyl
   * @type {boolean}
   */
move_in_: boolean,


}


/**
 *模型名称：清场
 *模型KEY:em_txn_cleaning
 */
interface TxnCleaningMethods extends IModelService<TxnCleaning> {
  /**
   * 验证数据采集值
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return null
   */
validate(containerId:string,workflowStepId:string):null;


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
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
