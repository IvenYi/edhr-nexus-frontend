import {CommonFields } from '../parent'

interface MaterialToErpEntry extends CommonFields {
  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 退料数量
   *
   * @author zyl
   * @type {number}
   */
return_qty_: number,


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
 *模型名称：物料退料详情
 *模型KEY:em_material_to_erp_entry
 */
interface MaterialToErpEntryMethods extends IModelService<MaterialToErpEntry> {
}
