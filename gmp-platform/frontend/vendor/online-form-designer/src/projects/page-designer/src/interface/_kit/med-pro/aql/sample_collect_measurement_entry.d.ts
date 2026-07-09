import {CommonFields } from '../parent'

interface SampleCollectMeasurementEntry extends CommonFields {
  /**
   * 值
   *
   * @author zyl
   * @type {string}
   */
value_: string,


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
   * 单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 布尔假
   *
   * @author zyl
   * @type {string}
   */
false_text_: string,


  /**
   * 布尔真
   *
   * @author zyl
   * @type {string}
   */
true_text_: string,


  /**
   * 展示上下限
   *
   * @author zyl
   * @type {boolean}
   */
show_limit_: boolean,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 类型
   *
   * @author zyl
   * @see {ValueType}
   * @type {string}
   */
type_: string,


  /**
   * 精度小数上限
   *
   * @author zyl
   * @type {number}
   */
max_decimal_: number,


  /**
   * 整数上限
   *
   * @author zyl
   * @type {number}
   */
max_int_: number,


  /**
   * 精度小数下限
   *
   * @author zyl
   * @type {number}
   */
min_decimal_: number,


  /**
   * 整数下限
   *
   * @author zyl
   * @type {number}
   */
min_int_: number,


}


/**
 *模型名称：样本数据采集历史测量型详情
 *模型KEY:em_sample_collect_measurement_entry
 */
interface SampleCollectMeasurementEntryMethods extends IModelService<SampleCollectMeasurementEntry> {
}
