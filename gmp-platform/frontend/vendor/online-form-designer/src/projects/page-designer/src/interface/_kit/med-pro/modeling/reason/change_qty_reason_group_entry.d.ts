import {CommonFields } from '../parent'

interface ChangeQtyReasonGroupEntry extends CommonFields {
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
   * 批次数量调整原因
   *
   * @author zyl
   * @see {ChangeQtyReason}
   * @type {string}
   */
change_qty_reason_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：批次数量调整原因组配置项
 *模型KEY:em_change_qty_reason_group_entry
 */
interface ChangeQtyReasonGroupEntryMethods extends IModelService<ChangeQtyReasonGroupEntry> {
}
