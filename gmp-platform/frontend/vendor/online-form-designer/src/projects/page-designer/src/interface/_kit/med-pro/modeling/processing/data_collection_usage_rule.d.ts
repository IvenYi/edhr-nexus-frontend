import {CommonFields } from '../parent'

interface DataCollectionUsageRule extends CommonFields {
  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * 产品家族
   *
   * @author zyl
   * @see {ProductFamily}
   * @type {string}
   */
product_family_id_: string,


  /**
   * 采集方式
   *
   * @author zyl
   * @see {ChecklistCollectionMethod}
   * @type {string}
   */
collection_method_: string,


  /**
   * 在线表单模版
   *
   * @author zyl
   * @type {string}
   */
online_form_tmpl_id_: string,


  /**
   * 事务
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


}


/**
 *模型名称：数据采集应用
 *模型KEY:em_data_collection_usage_rule
 */
interface DataCollectionUsageRuleMethods extends IModelService<DataCollectionUsageRule> {
}
