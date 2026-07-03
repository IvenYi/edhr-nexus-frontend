import {CommonFields } from '../parent'

interface ProcessParameterCardEntry extends CommonFields {
  /**
   * 序号
   *
   * @author zyl
   * @type {number}
   */
serial_number_: number,


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


  /**
   * 单位
   *
   * @author zyl
   * @type {string}
   */
uom_: string,


  /**
   * 参数卡属性值
   *
   * @author zyl
   * @type {string}
   */
value_: string,


}


/**
 *模型名称：工艺参数卡配置项
 *模型KEY:em_process_parameter_card_entry
 */
interface ProcessParameterCardEntryMethods extends IModelService<ProcessParameterCardEntry> {
}
