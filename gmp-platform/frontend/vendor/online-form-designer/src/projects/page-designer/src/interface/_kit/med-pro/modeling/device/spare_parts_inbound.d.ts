import {CommonFields } from '../parent'

interface SparePartsInbound extends CommonFields {
  /**
   * 库区
   *
   * @author zyl
   * @see {StorageArea}
   * @type {string}
   */
storage_area_id_: string,


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
   * 库位
   *
   * @author zyl
   * @see {StorageLocation}
   * @type {string}
   */
storage_location_id_: string,


  /**
   * 入库数量
   *
   * @author zyl
   * @type {number}
   */
inbound_qty_: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：备品备件入库
 *模型KEY:em_spare_parts_inbound
 */
interface SparePartsInboundMethods extends IModelService<SparePartsInbound> {
}
