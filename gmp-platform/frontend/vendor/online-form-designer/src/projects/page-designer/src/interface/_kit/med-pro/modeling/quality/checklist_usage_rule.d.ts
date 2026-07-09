import {CommonFields } from '../parent'

interface ChecklistUsageRule extends CommonFields {
  /**
   * 事务
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 检验单类型
   *
   * @author zyl
   * @see {CheckTaskType}
   * @type {string}
   */
type_: string,


  /**
   * 采集方式
   *
   * @author zyl
   * @see {ChecklistCollectionMethod}
   * @type {string}
   */
collection_method_: string,


  /**
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 在线表单模版
   *
   * @author zyl
   * @type {string}
   */
online_form_tmpl_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 检验单分类
   *
   * @author zyl
   * @see {ChecklistUsageRuleCategory}
   * @type {string}
   */
category_: string,


  /**
   * 业务流
   *
   * @author zyl
   * @type {string}
   */
process_key_: string,


  /**
   * 产品家族
   *
   * @author zyl
   * @see {ProductFamily}
   * @type {string}
   */
product_family_id_: string,


}


/**
 *模型名称：检验单应用
 *模型KEY:em_checklist_usage_rule
 */
interface ChecklistUsageRuleMethods extends IModelService<ChecklistUsageRule> {
}
