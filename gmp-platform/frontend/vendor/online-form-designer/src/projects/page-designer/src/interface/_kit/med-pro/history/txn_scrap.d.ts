import {CommonFields, ExecuteParams } from '../parent'

interface TxnScrap extends CommonFields {
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
   * 报废明细
   *
   * @author zyl
   * @see {TxnScrapDetail}
   * @type {string}
   */
entries_: string,


  /**
   * 工步别名
   *
   * @author zyl
   * @type {string}
   */
workflow_step_alias_id_: string,


  /**
   * 工步
   *
   * @author zyl
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 合格数
   *
   * @author zyl
   * @type {number}
   */
good_qty_: number,


  /**
   * 不合格数量
   *
   * @author zyl
   * @type {number}
   */
not_good_qty_: number,


  /**
   * 批次数量
   *
   * @author zyl
   * @type {number}
   */
container_qty_: number,


  /**
   * 过程处置
   *
   * @author zyl
   * @type {boolean}
   */
in_process_: boolean,


}


/**
 *模型名称：不良品处置
 *模型KEY:em_txn_scrap
 */
interface TxnScrapMethods extends IModelService<TxnScrap> {
  /**
   * 归咎工站
   *
   * @param1 containerId 批次id
   * @param2 process 是否过程中处置不良
   * @return Operation[]
   */
getBlamedOperations(containerId:string,process:boolean):Operation[];


  /**
   * 归咎工艺
   *
   * @param1 containerId 批次id
   * @param2 operationId 工站id
   * @return WorkflowStep[]
   */
getBlamedSpecs(containerId:string,operationId:string):WorkflowStep[];


  /**
   * 归咎工步
   *
   * @param1 containerId 批次id
   * @return string|WorkflowStep[]
   */
getBlamedWorkflowSteps(containerId:string):string|WorkflowStep[];


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
