import {CommonFields } from '../parent'

interface MfgOrderRecipeEntry extends CommonFields {
  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 投料顺序
   *
   * @author zyl
   * @type {number}
   */
feeding_sort_: number,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 投料类型
   *
   * @author zyl
   * @see {FeedingType}
   * @type {string}
   */
feeding_type_: string,


  /**
   * 投料范围
   *
   * @author zyl
   * @see {FeedingRange}
   * @type {string}
   */
feeding_range_: string,


  /**
   * 指定物料批次
   *
   * @author zyl
   * @see {MfgOrderRecipeMaterialEntry}
   * @type {string}
   */
entries_: string,


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
   * 上限
   *
   * @author zyl
   * @type {number}
   */
max_value_: number,


  /**
   * 下限
   *
   * @author zyl
   * @type {number}
   */
min_value_: number,


  /**
   * 标准量
   *
   * @author zyl
   * @type {number}
   */
standard_qty_: number,


  /**
   * 投料比例
   *
   * @author zyl
   * @type {number}
   */
feeding_rate_: number,


}


/**
 *模型名称：工单配方详情
 *模型KEY:em_mfg_order_recipe_entry
 */
interface MfgOrderRecipeEntryMethods extends IModelService<MfgOrderRecipeEntry> {
}
