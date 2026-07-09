import {CommonFields } from '../parent'

interface SubstituteMaterialEntry extends CommonFields {
  /**
   * 产品id
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


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
 *模型名称：替代料清单项
 *模型KEY:em_substitute_material_entry
 */
interface SubstituteMaterialEntryMethods extends IModelService<SubstituteMaterialEntry> {
}
