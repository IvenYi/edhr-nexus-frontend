import {CommonFields } from '../parent'

interface MaterialInventory extends CommonFields {
  /**
   * 库存数量
   *
   * @author zyl
   * @type {number}
   */
inventory_qty_: number,


  /**
   * 预警规则
   *
   * @author zyl
   * @see {InventoryWarningUsageRule}
   * @type {string}
   */
inventory_warning_usage_rule_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


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
   * 物料类型
   *
   * @author zyl
   * @see {MaterialContainerType}
   * @type {string}
   */
material_type_: string,


}


/**
 *模型名称：物料库存信息
 *模型KEY:em_material_inventory
 */
interface MaterialInventoryMethods extends IModelService<MaterialInventory> {
  /**
   * 扣除物料库存数量
   *
   * @param1  
   * @return void
   */
reduceInventoryQty():void;


  /**
   * 扣除物料库存数量
   *
   * @param1 productIds 物料ID数组（不重复）
   * @param2 productQtys 物料数量数组
   * @return void
   */
reduceMaterialInventoryQty(productIds:string[],productQtys:number[]):void;


}
