import {CommonFields } from '../parent'

interface MaterialRemoveHistory extends CommonFields {
  /**
   * 事务总线
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 分发类型
   *
   * @author zyl
   * @see {IssueType}
   * @type {string}
   */
issue_type_: string,


  /**
   * 分发批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 主批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
to_container_id_: string,


  /**
   * 分发历史
   *
   * @author zyl
   * @see {MaterialIssueHistory}
   * @type {string}
   */
issue_history_id_: string,


  /**
   * 移除数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 移除原因
   *
   * @author zyl
   * @see {RemoveReason}
   * @type {string}
   */
f_reason_for_removal_r6df: string,


  /**
   * 移除差异原因
   *
   * @author zyl
   * @see {RemoveDifferenceReason}
   * @type {string}
   */
f_remove_reasons_for_differences_r6df: string,


  /**
   * 移除前数量
   *
   * @author zyl
   * @type {number}
   */
f_be_remove_qty_szwu: number,


  /**
   * 物料开始时间
   *
   * @author zyl
   * @type {Date}
   */
effective_start_date_: Date,


  /**
   * 物料结束时间
   *
   * @author zyl
   * @type {Date}
   */
effective_end_date_: Date,


  /**
   * 批次号
   *
   * @author zyl
   * @type {string}
   */
container_name_: string,


  /**
   * 移除后数量
   *
   * @author zyl
   * @type {number}
   */
f_removed_qty_szwu: number,


  /**
   * 需求数量
   *
   * @author zyl
   * @type {number}
   */
qty_required_: number,


}


/**
 *模型名称：物料移除历史
 *模型KEY:em_material_remove_history
 */
interface MaterialRemoveHistoryMethods extends IModelService<MaterialRemoveHistory> {
}
