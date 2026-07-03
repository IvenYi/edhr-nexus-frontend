import {CommonFields ,NdoFields} from '../parent'

interface TrainingRequirementGroup extends   NdoFields,CommonFields {
  /**
   * 培训需求组配置项
   *
   * @author zyl
   * @see {TrainingRequirementGroupEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：培训需求组
 *模型KEY:em_training_requirement_group
 */
interface TrainingRequirementGroupMethods extends IModelService<TrainingRequirementGroup> {
}
