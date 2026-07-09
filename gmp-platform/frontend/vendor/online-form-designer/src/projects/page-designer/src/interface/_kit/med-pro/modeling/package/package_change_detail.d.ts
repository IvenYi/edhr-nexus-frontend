import {CommonFields } from '../parent'

interface PackageChangeDetail extends CommonFields {
  /**
   * 变更后
   *
   * @author zyl
   * @type {string}
   */
after_change_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 父批次名称
   *
   * @author zyl
   * @type {string}
   */
parent_name_: string,


  /**
   * 操作类型
   *
   * @author zyl
   * @see {OperationType}
   * @type {string}
   */
operation_type_: string,


  /**
   * 变更前
   *
   * @author zyl
   * @type {string}
   */
before_change_: string,


}


/**
 *模型名称：包装变更记录
 *模型KEY:em_package_change_detail
 */
interface PackageChangeDetailMethods extends IModelService<PackageChangeDetail> {
}
