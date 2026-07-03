import {CommonFields } from '../parent'

interface DataCollectionTaskInstanceAppendix extends CommonFields {
  /**
   * 在线表单实例
   *
   * @author zyl
   * @type {string}
   */
online_form_inst_id_: string,


  /**
   * 数据采集任务id
   *
   * @author zyl
   * @type {string}
   */
task_id_: string,


}


/**
 *模型名称：数据采集任务在线表单实例附加表
 *模型KEY:em_data_collection_task_instance_appendix
 */
interface DataCollectionTaskInstanceAppendixMethods extends IModelService<DataCollectionTaskInstanceAppendix> {
}
