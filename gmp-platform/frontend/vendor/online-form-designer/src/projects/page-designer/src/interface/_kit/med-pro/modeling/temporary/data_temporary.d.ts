import {CommonFields } from '../parent'

interface DataTemporary extends CommonFields {
  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 事务
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 数据类型
   *
   * @author zyl
   * @type {string}
   */
type_: string,


  /**
   * 暂存数据
   *
   * @author zyl
   * @type {string}
   */
value_: string,


  /**
   * 存储id
   *
   * @author zyl
   * @type {string}
   */
stash_id_: string,


  /**
   * 数据采集应用
   *
   * @author zyl
   * @see {DataTemporaryEntry}
   * @type {string}
   */
data_collection_entries_: string,


}


/**
 *模型名称：数据暂存
 *模型KEY:em_data_temporary
 */
interface DataTemporaryMethods extends IModelService<DataTemporary> {
}
