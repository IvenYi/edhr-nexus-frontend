import {CommonFields } from '../parent'

interface DataCollectionChange extends CommonFields {
  /**
   * 数据采集任务
   *
   * @author zyl
   * @see {DataCollectionTask}
   * @type {string}
   */
task_id_: string,


  /**
   * 数采变更明细
   *
   * @author zyl
   * @see {DataCollectionChangeEntry}
   * @type {string}
   */
entries_: string,


  /**
   * 数采变更状态
   *
   * @author zyl
   * @see {ChangeStatus}
   * @type {string}
   */
status_: string,


  /**
   * 审批流
   *
   * @author zyl
   * @type {string}
   */
process_key_: string,


}


/**
 *模型名称：数据采集变更
 *模型KEY:em_data_collection_change
 */
interface DataCollectionChangeMethods extends IModelService<DataCollectionChange> {
}
