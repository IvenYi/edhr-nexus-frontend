import {CommonFields ,RdoFields} from '../parent'

interface DataCollection extends RdoFields,CommonFields {
  /**
   * 运行状态
   *
   * @author zyl
   * @see {UsageStatus}
   * @type {string}
   */
status_: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 数据采集配置
   *
   * @author zyl
   * @see {DataCollectionEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：数据采集
 *模型KEY:em_data_collection
 */
interface DataCollectionMethods extends IRdoModelService<DataCollection> {
  /**
   * 验证数据采集值
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return null
   */
validate(containerId:string,workflowStepId:string):null;


}
