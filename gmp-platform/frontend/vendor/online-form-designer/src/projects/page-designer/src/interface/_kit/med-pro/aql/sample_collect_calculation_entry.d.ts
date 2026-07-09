import {CommonFields } from '../parent'

interface SampleCollectCalculationEntry extends CommonFields {
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
   * 拒绝数量
   *
   * @author zyl
   * @type {number}
   */
reject_qty_: number,


  /**
   * 拒绝原因
   *
   * @author zyl
   * @see {ChangeQtyReason}
   * @type {string}
   */
reject_reason_id_: string,


}


/**
 *模型名称：样本数据采集历史计数型详情
 *模型KEY:em_sample_collect_calculation_entry
 */
interface SampleCollectCalculationEntryMethods extends IModelService<SampleCollectCalculationEntry> {
}
