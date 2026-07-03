import {CommonFields } from '../parent'

interface TrainingRequirementGroupEntry extends CommonFields {
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
   * 培训需求
   *
   * @author zyl
   * @see {TrainingRequirement}
   * @type {string}
   */
training_requirement_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：培训需求配置项
 *模型KEY:em_training_requirement_group_entry
 */
interface TrainingRequirementGroupEntryMethods extends IModelService<TrainingRequirementGroupEntry> {
}
