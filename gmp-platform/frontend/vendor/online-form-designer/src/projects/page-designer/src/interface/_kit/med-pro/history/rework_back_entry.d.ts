import {CommonFields } from '../parent'

interface ReworkBackEntry extends CommonFields {
  /**
   * 返工顺序
   *
   * @author zyl
   * @type {number}
   */
serial_number_: number,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
workflow_id_: string,


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
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：返回路径项
 *模型KEY:em_rework_back_entry
 */
interface ReworkBackEntryMethods extends IModelService<ReworkBackEntry> {
}
