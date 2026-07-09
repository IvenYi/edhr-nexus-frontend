import {CommonFields ,NdoFields} from '../parent'

interface ProductFamily extends   NdoFields,CommonFields {
  /**
   * 工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
workflow_id_: string,


  /**
   * 流水号规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
sn_rule_id_: string,


  /**
   * 产品家族编码
   *
   * @author zyl
   * @type {string}
   */
code_: string,


  /**
   * 培训需求组
   *
   * @author zyl
   * @see {TrainingRequirementGroup}
   * @type {string}
   */
training_requirement_group_id_: string,


}


/**
 *模型名称：产品家族
 *模型KEY:em_product_family
 */
interface ProductFamilyMethods extends IModelService<ProductFamily> {
}
