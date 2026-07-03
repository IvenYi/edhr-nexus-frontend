import {CommonFields, ExecuteParams } from '../parent'

interface TxnSamplingCollect extends CommonFields {
  /**
   * 事务主体ID
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 采样任务
   *
   * @author zyl
   * @see {SamplingTask}
   * @type {string}
   */
sampling_task_id_: string,


  /**
   * 采样方式
   *
   * @author zyl
   * @see {SamplingMethod}
   * @type {string}
   */
sampling_method_id_: string,


  /**
   * 采样结果
   *
   * @author zyl
   * @see {SamplingResult}
   * @type {string}
   */
sampling_result_: string,


  /**
   * 样本信息
   *
   * @author zyl
   * @see {SampleInfo}
   * @type {string}
   */
sample_info_id_: string,


  /**
   * 采样批次
   *
   * @author zyl
   * @see {SamplingContainer}
   * @type {string}
   */
sampling_container_id_: string,


  /**
   * 测量型详情
   *
   * @author zyl
   * @see {SampleCollectMeasurementEntry}
   * @type {string}
   */
measurement_entries_: string,


  /**
   * 计数型详情
   *
   * @author zyl
   * @see {SampleCollectCalculationEntry}
   * @type {string}
   */
calculation_entries_: string,


  /**
   * 失败数量
   *
   * @author zyl
   * @type {number}
   */
failure_qty_: number,


  /**
   * 通过数量
   *
   * @author zyl
   * @type {number}
   */
pass_qty_: number,


  /**
   * 工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 重置
   *
   * @author zyl
   * @type {boolean}
   */
reset_: boolean,


}


/**
 *模型名称：采样批次数采
 *模型KEY:em_txn_sampling_collect
 */
interface TxnSamplingCollectMethods extends IModelService<TxnSamplingCollect> {
  /**
   * 自动出站
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
autoMove(containerId:string,workflowStepId:string):void;


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
