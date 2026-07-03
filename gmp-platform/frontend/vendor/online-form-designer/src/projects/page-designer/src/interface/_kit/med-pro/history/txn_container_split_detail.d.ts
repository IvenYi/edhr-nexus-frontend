import {CommonFields } from '../parent'

interface TxnContainerSplitDetail extends CommonFields {
  /**
   * 引用主模型数据 id
   *
   * @author zyl
   * @type {string}
   */
ref_master_id_: string,


  /**
   * 引用主模型key
   *
   * @author zyl
   * @type {string}
   */
ref_model_key_: string,


  /**
   * 引用主模型字段key
   *
   * @author zyl
   * @type {string}
   */
ref_field_key_: string,


  /**
   * 拆分的数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 拆分出的批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


}


/**
 *模型名称：批次拆分明细
 *模型KEY:em_txn_container_split_detail
 */
interface TxnContainerSplitDetailMethods extends IModelService<TxnContainerSplitDetail> {
}
