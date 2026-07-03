import {CommonFields } from '../parent'

interface SchedulingEntry extends CommonFields {
  /**
   * 班组
   *
   * @author zyl
   * @see {ShiftGroup}
   * @type {string}
   */
shift_group_id_: string,


  /**
   * 班次
   *
   * @author zyl
   * @see {Shift}
   * @type {string}
   */
shift_id_: string,


  /**
   * 班次开始时间
   *
   * @author zyl
   * @type {Date}
   */
shift_start_time_: Date,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


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
   * 班次结束时间
   *
   * @author zyl
   * @type {Date}
   */
shift_end_time_: Date,


}


/**
 *模型名称：生产排班配置项
 *模型KEY:em_scheduling_entry
 */
interface SchedulingEntryMethods extends IModelService<SchedulingEntry> {
}
