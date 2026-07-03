import {CommonFields } from '../parent'

interface MaterialChange extends CommonFields {
  /**
   * 备注
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 结束时间
   *
   * @author zyl
   * @type {Date}
   */
end_time_: Date,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 变更方式
   *
   * @author zyl
   * @see {MaterialChangeMethod}
   * @type {string}
   */
change_method_: string,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 变更前物料
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 变更后物料
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
change_product_id_: string,


  /**
   * 指定工单
   *
   * @author zyl
   * @see {MaterialChangeOrderEntry}
   * @type {string}
   */
order_entries_: string,


  /**
   * 需求数量
   *
   * @author zyl
   * @type {number}
   */
qty_require_: number,


  /**
   * 开始时间
   *
   * @author zyl
   * @type {Date}
   */
start_time_: Date,


  /**
   * 应用范围
   *
   * @author zyl
   * @see {MaterialChangeUsageRange}
   * @type {string}
   */
range_: string,


}


/**
 *模型名称：物料变更
 *模型KEY:em_material_change
 */
interface MaterialChangeMethods extends IModelService<MaterialChange> {
  /**
   * 获取有效的物料变更记录
   *
   * @param1 orderId 工单id
   * @return Object[]
   */
getValidMaterialChanges(orderId:string):Object[];


}
