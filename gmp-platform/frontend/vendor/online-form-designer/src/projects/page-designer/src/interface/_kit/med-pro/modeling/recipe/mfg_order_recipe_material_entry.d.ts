import {CommonFields } from '../parent'

interface MfgOrderRecipeMaterialEntry extends CommonFields {
  /**
   * 引用主模型key
   *
   * @author zyl
   * @type {string}
   */
ref_model_key_: string,


  /**
   * 引用主模型数据 id
   *
   * @author zyl
   * @type {string}
   */
ref_master_id_: string,


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
   * 指定物料批次
   *
   * @author zyl
   * @type {string}
   */
container_name_: string,


}


/**
 *模型名称：工单配方指定批次
 *模型KEY:em_mfg_order_recipe_material_entry
 */
interface MfgOrderRecipeMaterialEntryMethods extends IModelService<MfgOrderRecipeMaterialEntry> {
}
