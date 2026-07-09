import {CommonFields } from '../parent'

interface SignRequirementEntry extends CommonFields {
  /**
   * 引用主模型数据 id
   *
   * @author zyl
   * @type {string}
   */
ref_master_id_: string,


  /**
   * 签名组
   *
   * @author zyl
   * @see {SignGroup}
   * @type {string}
   */
sign_group_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


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
   * 会签组ID
   *
   * @author zyl
   * @see {CosignGroup}
   * @type {string}
   */
cosign_group_id_: string,


  /**
   * 会签数量
   *
   * @author zyl
   * @type {number}
   */
cosign_qty_: number,


  /**
   * 签名数量
   *
   * @author zyl
   * @type {number}
   */
sign_qty_: number,


  /**
   * 是否复核签名
   *
   * @author zyl
   * @type {boolean}
   */
review_: boolean,


}


/**
 *模型名称：签名需求配置项
 *模型KEY:em_sign_requirement_entry
 */
interface SignRequirementEntryMethods extends IModelService<SignRequirementEntry> {
}
