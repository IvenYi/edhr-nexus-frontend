import {CommonFields } from '../parent'

interface TxnReportEntry extends CommonFields {
  /**
   * 人员
   *
   * @author zyl
   * @type {string}
   */
user_id_: string,


  /**
   * 作业开始时间
   *
   * @author zyl
   * @type {Date}
   */
working_start_time_: Date,


  /**
   * 作业结束时间
   *
   * @author zyl
   * @type {Date}
   */
working_end_time_: Date,


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
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：报工详情
 *模型KEY:em_txn_report_entry
 */
interface TxnReportEntryMethods extends IModelService<TxnReportEntry> {
}
