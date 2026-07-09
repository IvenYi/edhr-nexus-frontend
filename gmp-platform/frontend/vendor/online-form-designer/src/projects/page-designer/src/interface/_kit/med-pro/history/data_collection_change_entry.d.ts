import {CommonFields } from '../parent'

interface DataCollectionChangeEntry extends CommonFields {
  /**
   * 类型
   *
   * @author zyl
   * @type {string}
   */
type_: string,


  /**
   * 修改前值
   *
   * @author zyl
   * @type {string}
   */
before_value_: string,


  /**
   * 修改后值
   *
   * @author zyl
   * @type {string}
   */
after_value_: string,


  /**
   * 数采变更状态
   *
   * @author zyl
   * @see {ChangeStatus}
   * @type {string}
   */
status_: string,


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
 *模型名称：数采变更明细
 *模型KEY:em_data_collection_change_entry
 */
interface DataCollectionChangeEntryMethods extends IModelService<DataCollectionChangeEntry> {
}
