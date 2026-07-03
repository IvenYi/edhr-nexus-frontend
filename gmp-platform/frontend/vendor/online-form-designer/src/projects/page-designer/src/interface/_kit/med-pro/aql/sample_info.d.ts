import {CommonFields } from '../parent'

interface SampleInfo extends CommonFields {
  /**
   * 单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_: string,


  /**
   * 值
   *
   * @author zyl
   * @type {string}
   */
value_: string,


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
   * 整数下限
   *
   * @author zyl
   * @type {number}
   */
min_int_: number,


  /**
   * 类型
   *
   * @author zyl
   * @see {ValueType}
   * @type {string}
   */
type_: string,


  /**
   * 整数上限
   *
   * @author zyl
   * @type {number}
   */
max_int_: number,


  /**
   * 精度小数上限
   *
   * @author zyl
   * @type {number}
   */
max_decimal_: number,


  /**
   * 精度小数下限
   *
   * @author zyl
   * @type {number}
   */
min_decimal_: number,


  /**
   * 展示上下限
   *
   * @author zyl
   * @type {boolean}
   */
show_limit_: boolean,


}


/**
 *模型名称：样本信息
 *模型KEY:em_sample_info
 */
interface SampleInfoMethods extends IModelService<SampleInfo> {
}
