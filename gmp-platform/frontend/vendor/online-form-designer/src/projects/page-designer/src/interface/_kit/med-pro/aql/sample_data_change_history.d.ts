import {CommonFields } from '../parent'

interface SampleDataChangeHistory extends CommonFields {
  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 检验级别
   *
   * @author zyl
   * @see {CheckLevel}
   * @type {string}
   */
check_level_id_: string,


  /**
   * 采样率
   *
   * @author zyl
   * @type {number}
   */
sampling_rate_: number,


  /**
   * 变更后检验级别
   *
   * @author zyl
   * @see {CheckLevel}
   * @type {string}
   */
change_check_level_id_: string,


  /**
   * 变更后采样率
   *
   * @author zyl
   * @type {number}
   */
change_sampling_rate_: number,


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
 *模型名称：样本数据变更历史
 *模型KEY:em_sample_data_change_history
 */
interface SampleDataChangeHistoryMethods extends IModelService<SampleDataChangeHistory> {
}
