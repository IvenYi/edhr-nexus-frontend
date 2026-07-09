import {CommonFields } from '../parent'

interface RecipeEntry extends CommonFields {
  /**
   * 引用主模型key
   *
   * @author zyl
   * @type {string}
   */
ref_model_key_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


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
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 标准量
   *
   * @author zyl
   * @type {number}
   */
standard_qty_: number,


  /**
   * 上限
   *
   * @author zyl
   * @type {number}
   */
max_value_: number,


  /**
   * 投料类型
   *
   * @author zyl
   * @see {FeedingType}
   * @type {string}
   */
feeding_type_: string,


  /**
   * 投料比例
   *
   * @author zyl
   * @type {number}
   */
feeding_rate_: number,


  /**
   * 投料范围
   *
   * @author zyl
   * @see {FeedingRange}
   * @type {string}
   */
feeding_range_: string,


  /**
   * 下限
   *
   * @author zyl
   * @type {number}
   */
min_value_: number,


  /**
   * 投料顺序
   *
   * @author zyl
   * @type {number}
   */
feeding_sort_: number,


  /**
   * 替代料清单
   *
   * @author zyl
   * @see {SubstituteMaterialEntry}
   * @type {string}
   */
substitute_material_entries_: string,


  /**
   * 替代料可混用
   *
   * @author zyl
   * @type {boolean}
   */
substitute_material_mixable_: boolean,


}


/**
 *模型名称：配方详情
 *模型KEY:em_recipe_entry
 */
interface RecipeEntryMethods extends IModelService<RecipeEntry> {
}
