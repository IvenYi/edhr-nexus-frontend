import {CommonFields } from '../parent'

interface DataCollectionTask extends CommonFields {
  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


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
   * 数据采集应用
   *
   * @author zyl
   * @see {DataCollectionUsageRule}
   * @type {string}
   */
data_collection_usage_rule_id_: string,


  /**
   * 数据采集任务项
   *
   * @author zyl
   * @see {DataCollectionItemHistory}
   * @type {string}
   */
entries_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * 采集方式
   *
   * @author zyl
   * @see {ChecklistCollectionMethod}
   * @type {string}
   */
collection_method_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 在线表单模版
   *
   * @author zyl
   * @type {string}
   */
online_form_tmpl_id_: string,


  /**
   * 工步别名
   *
   * @author zyl
   * @type {string}
   */
workflow_step_alias_id_: string,


  /**
   * 在线表单实例
   *
   * @author zyl
   * @type {string}
   */
online_form_inst_id_: string,


  /**
   * 事务
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 数采变更明细
   *
   * @author zyl
   * @see {DataCollectionChangeEntry}
   * @type {string}
   */
change_entries_: string,


  /**
   * 审批流
   *
   * @author zyl
   * @type {string}
   */
process_key_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 数采变更状态
   *
   * @author zyl
   * @see {ChangeStatus}
   * @type {string}
   */
change_collection_status_: string,


  /**
   * 数采变更原因
   *
   * @author zyl
   * @type {string}
   */
change_collection_reason_: string,


  /**
   * 检验单状态
   *
   * @author zyl
   * @see {DataCollectionStatus}
   * @type {string}
   */
status_: string,


  /**
   * 数采变更申请人员
   *
   * @author zyl
   * @type {string}
   */
change_collection_applicant_: string,


  /**
   * 数采变更申请时间
   *
   * @author zyl
   * @type {Date}
   */
change_collection_application_time_: Date,


  /**
   * 数采变更记录
   *
   * @author zyl
   * @see {DataCollectionChangeRecord}
   * @type {string}
   */
change_record_entries_: string,


}


/**
 *模型名称：数据采集任务
 *模型KEY:em_data_collection_task
 */
interface DataCollectionTaskMethods extends IModelService<DataCollectionTask> {
}
