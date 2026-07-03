import {CommonFields } from '../parent'

interface SparePartsRequisition extends CommonFields {
  /**
   * 领用单号
   *
   * @author zyl
   * @type {string}
   */
requisition_name_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 任务id
   *
   * @author zyl
   * @type {string}
   */
task_id_: string,


  /**
   * 状态
   *
   * @author zyl
   * @see {SparePartsOutboundStatus}
   * @type {string}
   */
status_: string,


  /**
   * 消耗类型
   *
   * @author zyl
   * @see {SparePartsConsumeType}
   * @type {string}
   */
consume_type_: string,


  /**
   * 领用详情
   *
   * @author zyl
   * @see {SparePartsRequisitionEntry}
   * @type {string}
   */
entries_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：备品备件领用
 *模型KEY:em_spare_parts_requisition
 */
interface SparePartsRequisitionMethods extends IModelService<SparePartsRequisition> {
}
