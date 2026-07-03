import {CommonFields } from '../parent'

interface TxnScrapDetail extends CommonFields {
  /**
   * 报废分类
   *
   * @author zyl
   * @see {NotGoodGroup}
   * @type {string}
   */
f_not_good_group_id_r6df: string,


  /**
   * 报废原因
   *
   * @author zyl
   * @see {NotGoodReason}
   * @type {string}
   */
f_not_good_reason_id_r6df: string,


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
   * 报废批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
scrap_container_id_: string,


  /**
   * 主批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 报废数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 归咎工站
   *
   * @author zyl
   * @see {Operation}
   * @type {string}
   */
blamed_operation_id_: string,


  /**
   * 归咎工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
blamed_spec_id_: string,


  /**
   * 归咎工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
blamed_workflow_step_id_: string,


  /**
   * 拆分为批次
   *
   * @author zyl
   * @type {boolean}
   */
f_split_to_container_r6df: boolean,


  /**
   * 报废数量1
   *
   * @author zyl
   * @type {number}
   */
container_qty_: number,


}


/**
 *模型名称：报废明细
 *模型KEY:em_txn_scrap_detail
 */
interface TxnScrapDetailMethods extends IModelService<TxnScrapDetail> {
}
