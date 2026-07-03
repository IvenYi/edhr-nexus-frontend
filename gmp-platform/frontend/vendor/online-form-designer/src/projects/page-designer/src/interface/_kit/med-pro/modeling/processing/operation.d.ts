import {CommonFields ,NdoFields} from '../parent'

interface Operation extends   NdoFields,CommonFields {
  /**
   * 工站编码
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


  /**
   * 车间
   *
   * @author zyl
   * @see {Shopfloor}
   * @type {string}
   */
shopfloor_id_: string,


  /**
   * 批次形态
   *
   * @author zyl
   * @see {ContainerModality}
   * @type {string}
   */
container_modality_id_: string,


  /**
   * 返工原因组
   *
   * @author zyl
   * @see {ReworkReasonGroup}
   * @type {string}
   */
rework_reason_group_id_: string,


  /**
   * 批次数量调整原因组
   *
   * @author zyl
   * @see {ChangeQtyReasonGroup}
   * @type {string}
   */
change_qty_reason_group_id_: string,


  /**
   * 跳站是否进站
   *
   * @author zyl
   * @type {boolean}
   */
move_in_necessarily_non_std_: boolean,


  /**
   * 是否需要进站
   *
   * @author zyl
   * @type {boolean}
   */
move_in_necessarily_: boolean,


}


/**
 *模型名称：工站
 *模型KEY:em_operation
 */
interface OperationMethods extends IModelService<Operation> {
}
