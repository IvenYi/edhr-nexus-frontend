import {CommonFields } from '../parent'

interface AqlLevelEntry extends CommonFields {
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
   * 样本代码
   *
   * @author zyl
   * @see {SampleCode}
   * @type {string}
   */
sample_code_: string,


  /**
   * 样本数量
   *
   * @author zyl
   * @type {number}
   */
sample_qty_: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 拒绝基数
   *
   * @author zyl
   * @type {number}
   */
reject_qty_: number,


  /**
   * AQL系数
   *
   * @author zyl
   * @see {AqlIndex}
   * @type {string}
   */
aql_index_: string,


}


/**
 *模型名称：AQL级别配置
 *模型KEY:em_aql_level_entry
 */
interface AqlLevelEntryMethods extends IModelService<AqlLevelEntry> {
}
