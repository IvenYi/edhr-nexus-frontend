import {CommonFields } from '../parent'

interface SamplingTask extends CommonFields {
  /**
   * 样本数量
   *
   * @author zyl
   * @type {number}
   */
sample_qty_: number,


  /**
   * 采样结果
   *
   * @author zyl
   * @see {SamplingResult}
   * @type {string}
   */
sampling_result_: string,


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
   * 采样计划
   *
   * @author zyl
   * @see {SamplingPlan}
   * @type {string}
   */
sampling_plan_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 采样率
   *
   * @author zyl
   * @type {number}
   */
sampling_rate_: number,


  /**
   * 检验级别
   *
   * @author zyl
   * @see {CheckLevel}
   * @type {string}
   */
check_level_id_: string,


  /**
   * 工步别名
   *
   * @author zyl
   * @type {string}
   */
workflow_step_alias_id_: string,


  /**
   * aql级别
   *
   * @author zyl
   * @see {AqlLevel}
   * @type {string}
   */
aql_level_id_: string,


  /**
   * 采样数量
   *
   * @author zyl
   * @type {number}
   */
sampling_total_qty_: number,


  /**
   * 通过数量
   *
   * @author zyl
   * @type {number}
   */
pass_total_qty_: number,


  /**
   * 失败数量
   *
   * @author zyl
   * @type {number}
   */
failure_total_qty_: number,


  /**
   * 采样率计数
   *
   * @author zyl
   * @type {number}
   */
sampling_count_: number,


  /**
   * 采样批次
   *
   * @author zyl
   * @see {SamplingContainer}
   * @type {string}
   */
sampling_container_id_: string,


  /**
   * 采样方式
   *
   * @author zyl
   * @see {SamplingMethod}
   * @type {string}
   */
sampling_method_id_: string,


  /**
   * 样本代码
   *
   * @author zyl
   * @see {SampleCode}
   * @type {string}
   */
sample_code_: string,


  /**
   * 拒绝基数
   *
   * @author zyl
   * @type {number}
   */
reject_qty_: number,


  /**
   * 待测试样本数
   *
   * @author zyl
   * @type {number}
   */
f_tested_sample_number_i24v: number,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 采样率总计数
   *
   * @author zyl
   * @type {number}
   */
sampling_total_count_: number,


  /**
   * 满足采样率
   *
   * @author zyl
   * @type {boolean}
   */
meet_sampling_rate_: boolean,


}


/**
 *模型名称：采样任务
 *模型KEY:em_sampling_task
 */
interface SamplingTaskMethods extends IModelService<SamplingTask> {
}
