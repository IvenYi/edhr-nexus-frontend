import {CommonFields } from '../parent'

interface SpecSnEntry extends CommonFields {
  /**
   * 事务
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 流水号规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
sn_rule_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


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


  /**
   * 生成方式
   *
   * @author zyl
   * @see {GenMethod}
   * @type {string}
   */
gen_method_: string,


}


/**
 *模型名称：工艺SN配置
 *模型KEY:em_spec_sn_entry
 */
interface SpecSnEntryMethods extends IModelService<SpecSnEntry> {
}
