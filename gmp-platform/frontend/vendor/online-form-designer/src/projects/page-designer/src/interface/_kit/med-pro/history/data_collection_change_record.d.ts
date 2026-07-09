import {CommonFields } from '../parent'

interface DataCollectionChangeRecord extends CommonFields {
  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 审核人员
   *
   * @author zyl
   * @type {string}
   */
auditor_: string,


  /**
   * 审核时间
   *
   * @author zyl
   * @type {Date}
   */
audit_time_: Date,


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


}


/**
 *模型名称：数采变更记录
 *模型KEY:em_data_collection_change_record
 */
interface DataCollectionChangeRecordMethods extends IModelService<DataCollectionChangeRecord> {
}
