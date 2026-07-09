import {CommonFields ,NdoFields} from '../parent'

interface MaterialContainer extends   NdoFields,CommonFields {
  /**
   * 发料单号
   *
   * @author zyl
   * @type {string}
   */
issuance_number_: string,


  /**
   * 供应商
   *
   * @author zyl
   * @see {Supplier}
   * @type {string}
   */
supplier_id_: string,


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
   * 入库数量
   *
   * @author zyl
   * @type {number}
   */
inbound_qty_: number,


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
   * 工厂
   *
   * @author zyl
   * @see {Factory}
   * @type {string}
   */
factory_id_: string,


  /**
   * 可入库数量
   *
   * @author zyl
   * @type {number}
   */
available_inbound_qty_: number,


  /**
   * erp批次名称
   *
   * @author zyl
   * @type {string}
   */
erp_name_: string,


  /**
   * 首次入库时间
   *
   * @author zyl
   * @type {Date}
   */
first_inbound_time_: Date,


  /**
   * 生产日期
   *
   * @author zyl
   * @type {Date}
   */
production_date_: Date,


  /**
   * 有效日期
   *
   * @author zyl
   * @type {Date}
   */
expire_date_: Date,


  /**
   * 库存数量
   *
   * @author zyl
   * @type {number}
   */
inventory_qty_: number,


  /**
   * 领料数量
   *
   * @author zyl
   * @type {number}
   */
requisition_qty_: number,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 物料批次类型
   *
   * @author zyl
   * @see {MaterialContainerType}
   * @type {string}
   */
material_container_type_: string,


  /**
   * 未检数量
   *
   * @author zyl
   * @type {number}
   */
unchecked_qty_: number,


  /**
   * 是否入库
   *
   * @author zyl
   * @type {boolean}
   */
inbound_: boolean,


  /**
   * 免检
   *
   * @author zyl
   * @type {boolean}
   */
exempt_: boolean,


  /**
   * 领料剩余数量
   *
   * @author zyl
   * @type {number}
   */
remaining_qty_: number,


  /**
   * 原始数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 默认入库工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
default_inbound_order_id_: string,


}


/**
 *模型名称：物料批次
 *模型KEY:em_material_container
 */
interface MaterialContainerMethods extends IModelService<MaterialContainer> {
  /**
   * 增加物料批次库存数量
   *
   * @param1 materialContainerIds 物料移除批次ID数组（不重复）
   * @param2 containerQtys 物料移除数量数组
   * @return void
   */
addInventoryQty(materialContainerIds:string[],containerQtys:number[]):void;


  /**
   * 增加物料批次剩余数量
   *
   * @param1 materialContainerIds 物料移除批次ID数组（不重复）
   * @param2 containerQtys 物料移除数量数组
   * @return void
   */
addRemainingQty(materialContainerIds:string[],containerQtys:number[]):void;


  /**
   * 获取物料批次仓库列表
   *
   * @param 
   * @return void
   */
batchGetWarehouses():void;


  /**
   * 根据名称获取批次
   *
   * @param1 name 批次名称
   * @return MaterialContainer
   */
getByName(name:string):MaterialContainer;


  /**
   * 获取物料批次仓库列表
   *
   * @param 
   * @return void
   */
getWarehousesOfIssueAndFeeding():void;


  /**
   * 获取物料批次仓库列表
   *
   * @param 
   * @return void
   */
getWarehouses():void;


  /**
   * 扣除物料批次库存数量
   *
   * @param1  
   * @return void
   */
reduceInventoryQty():void;


  /**
   * 扣除物料批次剩余数量
   *
   * @param1 materialContainerIds 物料分发批次ID数组（不重复）
   * @param2 containerQtys 物料分发数量数组
   * @return void
   */
reduceRemainingQty(materialContainerIds:string[],containerQtys:number[]):void;


  /**
   * 入库前置操作
   *
   * @param1 bodyValue 入库信息
   * @return void
   */
storedInTheWarehouse(bodyValue:object):void;


}
