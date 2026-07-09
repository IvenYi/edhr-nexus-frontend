import {CommonFields ,RdoFields} from '../parent'

interface TrainingRequirement extends RdoFields,CommonFields {
  /**
   * 文档
   *
   * @author zyl
   * @see {Document}
   * @type {string}
   */
document_id_: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 生效时间
   *
   * @author zyl
   * @type {Date}
   */
effective_start_date_: Date,


  /**
   * 失效时间
   *
   * @author zyl
   * @type {Date}
   */
effective_end_date_: Date,


}


/**
 *模型名称：培训需求
 *模型KEY:em_training_requirement
 */
interface TrainingRequirementMethods extends IRdoModelService<TrainingRequirement> {
}
