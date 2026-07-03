import {CommonFields } from '../parent'

interface SignGroupEntry extends CommonFields {
  /**
   * 人员
   *
   * @author zyl
   * @type {string}
   */
user_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


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


}


/**
 *模型名称：签名组人员配置
 *模型KEY:em_sign_group_entry
 */
interface SignGroupEntryMethods extends IModelService<SignGroupEntry> {
}
