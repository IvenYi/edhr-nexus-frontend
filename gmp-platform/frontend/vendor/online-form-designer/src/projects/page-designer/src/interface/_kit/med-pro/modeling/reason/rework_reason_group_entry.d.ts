import {CommonFields } from '../parent'

interface ReworkReasonGroupEntry extends CommonFields {
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
   * 返工原因
   *
   * @author zyl
   * @see {ReworkReason}
   * @type {string}
   */
rework_reason_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：返工原因组配置项
 *模型KEY:em_rework_reason_group_entry
 */
interface ReworkReasonGroupEntryMethods extends IModelService<ReworkReasonGroupEntry> {
}
