import {CommonFields } from '../parent'

interface SparePartsOutbound extends CommonFields {
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
   * 库存数量
   *
   * @author zyl
   * @type {number}
   */
inventory_qty_: number,


  /**
   * 消耗类型
   *
   * @author zyl
   * @see {SparePartsConsumeType}
   * @type {string}
   */
consume_type_: string,


  /**
   * 来源id
   *
   * @author zyl
   * @type {string}
   */
source_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：备品备件出库
 *模型KEY:em_spare_parts_outbound
 */
interface SparePartsOutboundMethods extends IModelService<SparePartsOutbound> {
}
