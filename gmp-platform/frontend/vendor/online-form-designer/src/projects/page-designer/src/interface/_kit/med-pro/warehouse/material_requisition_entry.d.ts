import {CommonFields } from '../parent'

interface MaterialRequisitionEntry extends CommonFields {
  /**
   * 需求数量
   *
   * @author zyl
   * @type {number}
   */
qty_require_: number,


  /**
   * 领料数量
   *
   * @author zyl
   * @type {number}
   */
requisition_qty_: number,


  /**
   * 已出数量
   *
   * @author zyl
   * @type {number}
   */
outbound_qty_: number,


  /**
   * 送达时间
   *
   * @author zyl
   * @type {Date}
   */
delivery_time_: Date,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_ids_: string,


  /**
   * 物料清单项
   *
   * @author zyl
   * @type {string}
   */
bom_entry_id_: string,


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
 *模型名称：生产领料明细
 *模型KEY:em_material_requisition_entry
 */
interface MaterialRequisitionEntryMethods extends IModelService<MaterialRequisitionEntry> {
}
