import {CommonFields } from '../parent'

interface TrainingPlanRequirementEntry extends CommonFields {
  /**
   * 培训需求
   *
   * @author zyl
   * @see {TrainingRequirement}
   * @type {string}
   */
training_requirement_id_: string,


  /**
   * 引用主模型数据 id
   *
   * @author zyl
   * @type {string}
   */
ref_master_id_: string,


  /**
   * 引用主模型key
   *
   * @author zyl
   * @type {string}
   */
ref_model_key_: string,


  /**
   * 引用主模型字段key
   *
   * @author zyl
   * @type {string}
   */
ref_field_key_: string,


  /**
   * 培训开始时间
   *
   * @author zyl
   * @type {Date}
   */
training_start_time_: Date,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：培训计划需求配置
 *模型KEY:em_training_plan_requirement_entry
 */
interface TrainingPlanRequirementEntryMethods extends IModelService<TrainingPlanRequirementEntry> {
}
