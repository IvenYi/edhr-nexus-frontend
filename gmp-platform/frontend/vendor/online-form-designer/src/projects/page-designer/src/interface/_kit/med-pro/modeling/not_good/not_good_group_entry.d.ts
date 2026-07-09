import {CommonFields } from '../parent'

interface NotGoodGroupEntry extends CommonFields {
  /**
   * 不良原因
   *
   * @author zyl
   * @see {NotGoodReason}
   * @type {string}
   */
not_good_reason_id_: string,


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


}


/**
 *模型名称：不良分类原因配置项
 *模型KEY:em_not_good_group_entry
 */
interface NotGoodGroupEntryMethods extends IModelService<NotGoodGroupEntry> {
}
