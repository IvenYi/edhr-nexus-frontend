import {CommonFields } from '../parent'

interface CheckLevelEntry extends CommonFields {
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
   * 最大数量
   *
   * @author zyl
   * @type {number}
   */
max_qty_: number,


  /**
   * 最小数量
   *
   * @author zyl
   * @type {number}
   */
min_qty_: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 样本代码
   *
   * @author zyl
   * @see {SampleCode}
   * @type {string}
   */
sample_code_: string,


}


/**
 *模型名称：检验级别配置
 *模型KEY:em_check_level_entry
 */
interface CheckLevelEntryMethods extends IModelService<CheckLevelEntry> {
}
