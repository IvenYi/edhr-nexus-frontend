import {CommonFields } from '../parent'

interface MfgOrderRecipe extends CommonFields {
  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


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
   * 投料顺序
   *
   * @author zyl
   * @type {number}
   */
feeding_sort_: number,


  /**
   * 上限
   *
   * @author zyl
   * @type {number}
   */
max_value_: number,


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
   * 标准量
   *
   * @author zyl
   * @type {number}
   */
standard_qty_: number,


  /**
   * 指定物料批次
   *
   * @author zyl
   * @see {MfgOrderRecipeMaterialEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：工单配方列表
 *模型KEY:em_mfg_order_recipe
 */
interface MfgOrderRecipeMethods extends IModelService<MfgOrderRecipe> {
}
