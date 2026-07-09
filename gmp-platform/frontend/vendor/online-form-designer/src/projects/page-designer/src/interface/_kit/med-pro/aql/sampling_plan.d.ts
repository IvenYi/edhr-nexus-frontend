import {CommonFields ,NdoFields} from '../parent'

interface SamplingPlan extends   NdoFields,CommonFields {
  /**
   * 采样计划配置
   *
   * @author zyl
   * @see {SamplingPlanEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：采样计划
 *模型KEY:em_sampling_plan
 */
interface SamplingPlanMethods extends IModelService<SamplingPlan> {
}
