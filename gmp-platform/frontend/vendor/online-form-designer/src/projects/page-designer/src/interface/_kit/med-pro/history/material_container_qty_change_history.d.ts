import {CommonFields } from '../parent'

interface MaterialContainerQtyChangeHistory extends CommonFields {
  /**
   * 物料批次id
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


  /**
   * 调整原因
   *
   * @author zyl
   * @see {ChangeQtyReason}
   * @type {string}
   */
change_qty_reason_id_: string,


  /**
   * 物料仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 调整前数量
   *
   * @author zyl
   * @type {number}
   */
before_qty_: number,


  /**
   * 备注
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 调整后数量
   *
   * @author zyl
   * @type {number}
   */
after_qty_: number,


}


/**
 *模型名称：物料批次数量调整记录
 *模型KEY:em_material_container_qty_change_history
 */
interface MaterialContainerQtyChangeHistoryMethods extends IModelService<MaterialContainerQtyChangeHistory> {
}
