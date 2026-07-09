import {CommonFields, ExecuteParams } from '../parent'

interface TxnCheck extends CommonFields {
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
   * 工艺步骤iD
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 校验结果
   *
   * @author zyl
   * @see {CheckTaskResult}
   * @type {string}
   */
check_result_: string,


}


/**
 *模型名称：检验
 *模型KEY:em_txn_check
 */
interface TxnCheckMethods extends IModelService<TxnCheck> {
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
