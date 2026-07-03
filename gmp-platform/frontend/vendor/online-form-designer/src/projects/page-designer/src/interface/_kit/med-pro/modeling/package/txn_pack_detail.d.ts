import {CommonFields } from '../parent'

interface TxnPackDetail extends CommonFields {
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
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 工站
   *
   * @author zyl
   * @see {Operation}
   * @type {string}
   */
operation_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 包装类型
   *
   * @author zyl
   * @see {PackageType}
   * @type {string}
   */
pack_type_: string,


  /**
   * 批次名称
   *
   * @author zyl
   * @type {string}
   */
container_name_: string,


  /**
   * 父批次名称
   *
   * @author zyl
   * @type {string}
   */
parent_container_name_: string,


  /**
   * 批次形态
   *
   * @author zyl
   * @see {ContainerModality}
   * @type {string}
   */
container_modality_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 拓展属性
   *
   * @author zyl
   * @see {PackageExpansion}
   * @type {string}
   */
package_expansion_id_: string,


}


/**
 *模型名称：包装明细
 *模型KEY:em_txn_pack_detail
 */
interface TxnPackDetailMethods extends IModelService<TxnPackDetail> {
}
