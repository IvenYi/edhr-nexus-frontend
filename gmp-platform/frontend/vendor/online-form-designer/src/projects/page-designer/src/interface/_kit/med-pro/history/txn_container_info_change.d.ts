import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerInfoChange extends CommonFields {
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
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 批次形态
   *
   * @author zyl
   * @see {ContainerModality}
   * @type {string}
   */
container_modality_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 采样批次
   *
   * @author zyl
   * @see {SamplingContainer}
   * @type {string}
   */
sampling_container_id_: string,


  /**
   * 生产指定项
   *
   * @author zyl
   * @see {ProductionSpecification}
   * @type {string}
   */
production_specification_entries_: string,


}


/**
 *模型名称：批次信息调整
 *模型KEY:em_txn_container_info_change
 */
interface TxnContainerInfoChangeMethods extends IModelService<TxnContainerInfoChange> {
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
