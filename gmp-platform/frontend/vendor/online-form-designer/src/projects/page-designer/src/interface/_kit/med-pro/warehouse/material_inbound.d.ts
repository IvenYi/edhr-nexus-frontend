import {CommonFields } from '../parent'

interface MaterialInbound extends CommonFields {
  /**
   * 入库标签
   *
   * @author zyl
   * @see {LabelTemplate}
   * @type {string}
   */
inbound_label_template_id_: string,


  /**
   * 入库数量
   *
   * @author zyl
   * @type {number}
   */
inbound_qty_: number,


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
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
container_id_: string,


  /**
   * 入库类别
   *
   * @author zyl
   * @see {InboundType}
   * @type {string}
   */
type_: string,


  /**
   * 入库人员
   *
   * @author zyl
   * @type {string}
   */
inbound_operator_: string,


  /**
   * 入库时间
   *
   * @author zyl
   * @type {Date}
   */
inbound_time_: Date,


  /**
   * 入库单号
   *
   * @author zyl
   * @type {string}
   */
inbound_number_: string,


  /**
   * 入库编码规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
inbound_sn_rule_id_: string,


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
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 入库标签
   *
   * @author zyl
   * @type {string}
   */
inbound_label_id_: string,


  /**
   * 入库方式
   *
   * @author zyl
   * @see {MaterialInboundType}
   * @type {string}
   */
inbound_type_: string,


  /**
   * 来源ID
   *
   * @author zyl
   * @type {string}
   */
source_id_: string,


}


/**
 *模型名称：物料入库管理
 *模型KEY:em_material_inbound
 */
interface MaterialInboundMethods extends IModelService<MaterialInbound> {
}
