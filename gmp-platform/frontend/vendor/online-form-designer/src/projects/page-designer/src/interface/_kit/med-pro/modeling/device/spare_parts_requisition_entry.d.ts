import {CommonFields } from '../parent'

interface SparePartsRequisitionEntry extends CommonFields {
  /**
   * 备品备件
   *
   * @author zyl
   * @see {SpareParts}
   * @type {string}
   */
spare_parts_id_: string,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 库区
   *
   * @author zyl
   * @see {StorageArea}
   * @type {string}
   */
storage_area_id_: string,


  /**
   * 库位
   *
   * @author zyl
   * @see {StorageLocation}
   * @type {string}
   */
storage_location_id_: string,


  /**
   * 出库数量
   *
   * @author zyl
   * @type {number}
   */
outbound_qty_: number,


  /**
   * 领用数量
   *
   * @author zyl
   * @type {number}
   */
requisition_qty_: number,


  /**
   * 入库数量
   *
   * @author zyl
   * @type {number}
   */
inventory_qty_: number,


  /**
   * 使用数量
   *
   * @author zyl
   * @type {number}
   */
used_qty_: number,


  /**
   * 剩余数量
   *
   * @author zyl
   * @type {number}
   */
remaining_qty_: number,


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
 *模型名称：备品备件领用详情
 *模型KEY:em_spare_parts_requisition_entry
 */
interface SparePartsRequisitionEntryMethods extends IModelService<SparePartsRequisitionEntry> {
}
