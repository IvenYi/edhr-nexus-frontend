import {CommonFields, ExecuteParams } from '../parent'

interface TxnMaterialSupplement extends CommonFields {
  /**
   * 事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 批次产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 事务ID
   *
   * @author zyl
   * @type {string}
   */
txn_id_: string,


  /**
   * 事务主体ID
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 生产补料详情
   *
   * @author zyl
   * @see {TxnMaterialSupplementEntry}
   * @type {string}
   */
material_supplement_entry: string,


  /**
   * 补料车间
   *
   * @author zyl
   * @see {Shopfloor}
   * @type {string}
   */
shopfloor_id_: string,


}


/**
 *模型名称：生产补料
 *模型KEY:em_txn_material_supplement
 */
interface TxnMaterialSupplementMethods extends IModelService<TxnMaterialSupplement> {
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
