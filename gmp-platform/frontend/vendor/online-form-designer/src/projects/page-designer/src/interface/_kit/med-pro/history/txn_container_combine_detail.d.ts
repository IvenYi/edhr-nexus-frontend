import {CommonFields } from '../parent'

interface TxnContainerCombineDetail extends CommonFields {
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
   * 合并的数量
   *
   * @author zyl
   * @type {number}
   */
combine_qty_: number,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 数量为0自动关闭
   *
   * @author zyl
   * @type {boolean}
   */
close_when_empty_: boolean,


}


/**
 *模型名称：批次合并明细
 *模型KEY:em_txn_container_combine_detail
 */
interface TxnContainerCombineDetailMethods extends IModelService<TxnContainerCombineDetail> {
}
