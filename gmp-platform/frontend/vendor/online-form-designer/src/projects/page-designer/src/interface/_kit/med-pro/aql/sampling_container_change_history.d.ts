import {CommonFields } from '../parent'

interface SamplingContainerChangeHistory extends CommonFields {
  /**
   * 采样批次
   *
   * @author zyl
   * @see {SamplingContainer}
   * @type {string}
   */
sampling_container_id_: string,


  /**
   * 采样批次数量
   *
   * @author zyl
   * @type {number}
   */
sampling_qty_: number,


  /**
   * 采样率
   *
   * @author zyl
   * @type {number}
   */
sampling_rate_: number,


  /**
   * 变更后采样批次数量
   *
   * @author zyl
   * @type {number}
   */
change_sampling_qty_: number,


  /**
   * 变更后采样率
   *
   * @author zyl
   * @type {number}
   */
change_sampling_rate_: number,


  /**
   * 采样任务
   *
   * @author zyl
   * @see {SamplingTask}
   * @type {string}
   */
sampling_task_id_: string,


  /**
   * 备注
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


}


/**
 *模型名称：采样批次变更历史
 *模型KEY:em_sampling_container_change_history
 */
interface SamplingContainerChangeHistoryMethods extends IModelService<SamplingContainerChangeHistory> {
}
