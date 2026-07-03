import {CommonFields } from '../parent'

interface ContainerSpec extends CommonFields {
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
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


}


/**
 *模型名称：批次工艺
 *模型KEY:em_container_spec
 */
interface ContainerSpecMethods extends IModelService<ContainerSpec> {
}
