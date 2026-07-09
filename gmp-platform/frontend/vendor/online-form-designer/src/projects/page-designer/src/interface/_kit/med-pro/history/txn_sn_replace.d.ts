import {CommonFields, ExecuteParams } from '../parent'

interface TxnSnReplace extends CommonFields {
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
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 流水号规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
sn_rule_id_: string,


  /**
   * 置换前批次
   *
   * @author zyl
   * @type {string}
   */
before_container_name_: string,


  /**
   * 置换后批次
   *
   * @author zyl
   * @type {string}
   */
after_container_name_: string,


  /**
   * 置换前物料批次
   *
   * @author zyl
   * @type {string}
   */
before_material_container_name_: string,


  /**
   * 置换后物料批次
   *
   * @author zyl
   * @type {string}
   */
after_material_container_name_: string,


  /**
   * 置换次数
   *
   * @author zyl
   * @type {number}
   */
replace_times_: number,


  /**
   * 工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


}


/**
 *模型名称：SN置换
 *模型KEY:em_txn_sn_replace
 */
interface TxnSnReplaceMethods extends IModelService<TxnSnReplace> {
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
