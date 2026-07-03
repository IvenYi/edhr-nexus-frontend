import {CommonFields } from '../parent'

interface BasicStatistics extends CommonFields {
  /**
   * 进站人员
   *
   * @author zyl
   * @type {string}
   */
move_in_user_id_: string,


  /**
   * 出站人员
   *
   * @author zyl
   * @type {string}
   */
move_user_id_: string,


  /**
   * 报工人员
   *
   * @author zyl
   * @type {string}
   */
report_user_ids_: string,


  /**
   * 开工时间
   *
   * @author zyl
   * @type {Date}
   */
production_start_time_: Date,


  /**
   * 完工时间
   *
   * @author zyl
   * @type {Date}
   */
production_end_time_: Date,


  /**
   * 出站数量
   *
   * @author zyl
   * @type {number}
   */
move_qty_: number,


  /**
   * 进站数量
   *
   * @author zyl
   * @type {number}
   */
move_in_qty_: number,


  /**
   * 报工数量
   *
   * @author zyl
   * @type {number}
   */
report_qty_: number,


  /**
   * 不良数量
   *
   * @author zyl
   * @type {number}
   */
not_good_qty_: number,


  /**
   * 出站设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
move_device_ids_: string,


  /**
   * 进站设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
move_in_device_ids_: string,


  /**
   * 暂停时长
   *
   * @author zyl
   * @type {number}
   */
suspend_duration_: number,


  /**
   * 搁置时长
   *
   * @author zyl
   * @type {number}
   */
hold_duration_: number,


  /**
   * 关闭时长
   *
   * @author zyl
   * @type {number}
   */
close_duration_: number,


  /**
   * 出站事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
move_mainline_id_: string,


  /**
   * 进站事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
move_in_mainline_id_: string,


  /**
   * 实际时长
   *
   * @author zyl
   * @type {number}
   */
duration_: number,


  /**
   * 工步别名
   *
   * @author zyl
   * @type {string}
   */
workflow_step_alias_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 工艺步骤
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


  /**
   * 进站签名
   *
   * @author zyl
   * @type {string}
   */
move_in_signature_images_: string,


  /**
   * 出站签名
   *
   * @author zyl
   * @type {string}
   */
move_signature_images_: string,


  /**
   * 报工签名
   *
   * @author zyl
   * @type {string}
   */
report_signature_images_: string,


}


/**
 *模型名称：基础统计信息
 *模型KEY:em_basic_statistics
 */
interface BasicStatisticsMethods extends IModelService<BasicStatistics> {
}
