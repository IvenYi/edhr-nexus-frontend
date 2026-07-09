import {CommonFields } from '../parent'

interface MaterialOutbound extends CommonFields {
  /**
   * 出库数量
   *
   * @author zyl
   * @type {number}
   */
outbound_qty_: number,


  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
container_id_: string,


  /**
   * 出库人员
   *
   * @author zyl
   * @type {string}
   */
outbound_operator_: string,


  /**
   * 出库时间
   *
   * @author zyl
   * @type {Date}
   */
outbound_time_: Date,


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
   * 领料单详情
   *
   * @author zyl
   * @see {MaterialRequisitionEntry}
   * @type {string}
   */
requisition_entry_id_: string,


  /**
   * 需求数量
   *
   * @author zyl
   * @type {number}
   */
qty_require_: number,


  /**
   * 指定批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_ids_: string,


  /**
   * 剩余数量
   *
   * @author zyl
   * @type {number}
   */
residual_qty_: number,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 领料单
   *
   * @author zyl
   * @see {MaterialRequisition}
   * @type {string}
   */
requisition_id_: string,


  /**
   * 出库方式
   *
   * @author zyl
   * @see {MaterialOutboundType}
   * @type {string}
   */
outbound_type_: string,


  /**
   * 来源ID
   *
   * @author zyl
   * @type {string}
   */
source_id_: string,


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


}


/**
 *模型名称：物料出库信息
 *模型KEY:em_material_outbound
 */
interface MaterialOutboundMethods extends IModelService<MaterialOutbound> {
  /**
   * 扣除剩余数量(根据仓库)
   *
   * @param1 orderId 工单id
   * @param2  
   * @return void
   */
reduceResidualQtyByWarehouseBatch(orderId:string):void;


  /**
   * 扣除剩余数量
   *
   * @param1 orderId 工单id
   * @param2 materialContainerIds 物料批次数组
   * @param3 qtys 扣减数量数组
   * @return void
   */
reduceResidualQtyBatch(orderId:string,materialContainerIds:string[],qtys:number[]):void;


  /**
   * 扣除剩余数量
   *
   * @param1 orderId 工单id
   * @param2 materialContainerId 物料批次
   * @param3 qty 扣减数量
   * @return void
   */
reduceResidualQty(orderId:string,materialContainerId:string,qty:number):void;


}
