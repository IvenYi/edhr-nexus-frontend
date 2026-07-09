import {CommonFields } from '../parent'

interface MaterialIssueHistory extends CommonFields {
  /**
   * 工艺步骤iD
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


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
   * 主批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
to_container_id_: string,


  /**
   * 分发总数量
   *
   * @author zyl
   * @type {number}
   */
total_qty_: number,


  /**
   * 分发数量不同原因
   *
   * @author zyl
   * @see {IssueQtyDifferenceReason}
   * @type {string}
   */
f_difference_reason_r6df: string,


  /**
   * 物料清单项
   *
   * @author zyl
   * @see {BomEntry}
   * @type {string}
   */
bom_entry_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 工步别名
   *
   * @author zyl
   * @type {string}
   */
workflow_step_alias_id_: string,


  /**
   * 物料结束时间
   *
   * @author zyl
   * @type {Date}
   */
effective_end_date_: Date,


  /**
   * 物料开始时间
   *
   * @author zyl
   * @type {Date}
   */
effective_start_date_: Date,


  /**
   * 批次号
   *
   * @author zyl
   * @type {string}
   */
container_name_: string,


  /**
   * 分发批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
container_id_: string,


  /**
   * 替代料清单
   *
   * @author zyl
   * @see {SubstituteMaterialEntry}
   * @type {string}
   */
f_sub_material_8n7m: string,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 分发数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 移除总数量
   *
   * @author zyl
   * @type {number}
   */
removed_total_qty_: number,


  /**
   * 需求数量
   *
   * @author zyl
   * @type {number}
   */
qty_required_: number,


}


/**
 *模型名称：物料分发历史
 *模型KEY:em_material_issue_history
 */
interface MaterialIssueHistoryMethods extends IModelService<MaterialIssueHistory> {
  /**
   * 根据批次号查询物料分发历史
   *
   * @param1 containerName 批次名称
   * @return MaterialIssueHistory
   */
listAllByContainerName(containerName:string):MaterialIssueHistory;


}
