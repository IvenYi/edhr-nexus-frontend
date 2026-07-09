import {CommonFields } from '../parent'

interface TxnMaterialSupplementEntry extends CommonFields {
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
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 补料数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 补料产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
supplement_product_id_: string,


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
   * 批次产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


}


/**
 *模型名称：生产补料详情 
 *模型KEY:em_txn_material_supplement_entry
 */
interface TxnMaterialSupplementEntryMethods extends IModelService<TxnMaterialSupplementEntry> {
}
