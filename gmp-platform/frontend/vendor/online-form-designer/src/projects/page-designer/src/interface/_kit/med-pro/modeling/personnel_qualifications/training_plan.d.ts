import {CommonFields ,NdoFields} from '../parent'

interface TrainingPlan extends   NdoFields,CommonFields {
  /**
   * 培训计划需求配置项
   *
   * @author zyl
   * @see {TrainingPlanRequirementEntry}
   * @type {string}
   */
requirement_entries_: string,


  /**
   * 导师配置项
   *
   * @author zyl
   * @see {TrainingPlanUserEntry}
   * @type {string}
   */
teacher_entries_: string,


  /**
   * 学生配置项
   *
   * @author zyl
   * @see {TrainingPlanUserEntry}
   * @type {string}
   */
student_entries_: string,


}


/**
 *模型名称：培训计划
 *模型KEY:em_training_plan
 */
interface TrainingPlanMethods extends IModelService<TrainingPlan> {
}
