import {CommonFields } from '../parent'

interface ContainerQty extends CommonFields {
  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 事务key
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 工步别名
   *
   * @author zyl
   * @type {string}
   */
workflow_step_alias_id_: string,


}


/**
 *模型名称：批次数量
 *模型KEY:em_container_qty
 */
interface ContainerQtyMethods extends IModelService<ContainerQty> {
}
