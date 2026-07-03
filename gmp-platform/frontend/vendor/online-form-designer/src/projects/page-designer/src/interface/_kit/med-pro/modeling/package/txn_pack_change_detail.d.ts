import {CommonFields } from '../parent'

interface TxnPackChangeDetail extends CommonFields {
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
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 父批次名称
   *
   * @author zyl
   * @type {string}
   */
parent_name_: string,


  /**
   * 操作类型
   *
   * @author zyl
   * @see {OperationType}
   * @type {string}
   */
operation_type_: string,


  /**
   * 包装数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 包装类型
   *
   * @author zyl
   * @see {PackageType}
   * @type {string}
   */
pack_type_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：包装变更明细
 *模型KEY:em_txn_pack_change_detail
 */
interface TxnPackChangeDetailMethods extends IModelService<TxnPackChangeDetail> {
}
