import {CommonFields } from '../parent'

interface OrderSnEntry extends CommonFields {
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
   * 使用状态
   *
   * @author zyl
   * @type {boolean}
   */
status_: boolean,


}


/**
 *模型名称：erp指定sn
 *模型KEY:em_order_sn_entry
 */
interface OrderSnEntryMethods extends IModelService<OrderSnEntry> {
}
