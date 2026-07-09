import {CommonFields } from '../parent'

interface DataTemporaryEntry extends CommonFields {
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
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * 数据采集应用
   *
   * @author zyl
   * @see {DataCollectionUsageRule}
   * @type {string}
   */
data_collection_usage_rule_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：数据采集暂存数据采集
 *模型KEY:em_data_temporary_entry
 */
interface DataTemporaryEntryMethods extends IModelService<DataTemporaryEntry> {
}
