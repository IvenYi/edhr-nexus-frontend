import {CommonFields } from '../parent'

interface TrainingPlanUserEntry extends CommonFields {
  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 人员
   *
   * @author zyl
   * @type {string}
   */
user_id_: string,


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


}


/**
 *模型名称：培训计划人员配置
 *模型KEY:em_training_plan_user_entry
 */
interface TrainingPlanUserEntryMethods extends IModelService<TrainingPlanUserEntry> {
}
