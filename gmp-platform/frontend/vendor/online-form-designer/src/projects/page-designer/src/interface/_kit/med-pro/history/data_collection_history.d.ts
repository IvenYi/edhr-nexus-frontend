import {CommonFields } from '../parent'

interface DataCollectionHistory extends CommonFields {
  /**
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * 事务
   *
   * @author zyl
   * @type {number}
   */
txn_id_: number,


  /**
   * 事务总线
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 设备总线
   *
   * @author zyl
   * @see {TxnDeviceMainline}
   * @type {string}
   */
device_mainline_id_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


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
   * 数据采集历史项
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


}


/**
 *模型名称：数据采集历史(已废弃)
 *模型KEY:em_data_collection_history
 */
interface DataCollectionHistoryMethods extends IModelService<DataCollectionHistory> {
}
