import {CommonFields } from '../parent'

interface TxnContainerAssociationDetail extends CommonFields {
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
   * 主批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
parent_container_id_: string,


  /**
   * 数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


}


/**
 *模型名称：批次关联明细
 *模型KEY:em_txn_container_association_detail
 */
interface TxnContainerAssociationDetailMethods extends IModelService<TxnContainerAssociationDetail> {
}
