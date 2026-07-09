import {CommonFields } from '../parent'

interface BomEntry extends CommonFields {
  /**
   * 物料开始时间
   *
   * @author zyl
   * @type {Date}
   */
effective_start_date_: Date,


  /**
   * 物料结束时间
   *
   * @author zyl
   * @type {Date}
   */
effective_end_date_: Date,


  /**
   * 允许消耗不足
   *
   * @author zyl
   * @type {boolean}
   */
allow_under_consumption_: boolean,


  /**
   * 允许过度消耗
   *
   * @author zyl
   * @type {boolean}
   */
allow_over_consumption_: boolean,


  /**
   * 指定物料
   *
   * @author zyl
   * @type {boolean}
   */
specific_material_enabled_: boolean,


  /**
   * 替代料可混用
   *
   * @author zyl
   * @type {boolean}
   */
substitute_material_mixable_: boolean,


  /**
   * 替代料清单
   *
   * @author zyl
   * @see {SubstituteMaterialEntry}
   * @type {string}
   */
substitute_material_entries_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 分发类型
   *
   * @author zyl
   * @see {IssueType}
   * @type {string}
   */
issue_type_: string,


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
   * 单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 需求数量
   *
   * @author zyl
   * @type {number}
   */
qty_require_: number,


  /**
   * 物料批次
   *
   * @author zyl
   * @see {BomMaterialContainerEntry}
   * @type {string}
   */
material_container_entries_: string,


  /**
   * 是否可编辑
   *
   * @author zyl
   * @type {boolean}
   */
f_editable_c0pl: boolean,


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


}


/**
 *模型名称：物料清单项
 *模型KEY:em_bom_entry
 */
interface BomEntryMethods extends IModelService<BomEntry> {
}
