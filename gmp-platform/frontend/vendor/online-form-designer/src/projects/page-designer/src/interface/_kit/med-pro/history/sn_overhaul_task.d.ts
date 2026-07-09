import {CommonFields } from '../parent'

interface SnOverhaulTask extends CommonFields {
  /**
   * sn
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
sn_container_id_: string,


  /**
   * 描述
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 设备故障分类
   *
   * @author zyl
   * @see {DeviceFailureGroup}
   * @type {string}
   */
device_failure_group_id_: string,


  /**
   * 故障维修项目
   *
   * @author zyl
   * @see {FailureOverhaulItem}
   * @type {string}
   */
failure_overhaul_item_id_: string,


  /**
   * 同行人员
   *
   * @author zyl
   * @type {string}
   */
together_user_id_: string,


  /**
   * 通知时间
   *
   * @author zyl
   * @type {Date}
   */
noticed_time_: Date,


  /**
   * 到达时间
   *
   * @author zyl
   * @type {Date}
   */
arrived_time_: Date,


  /**
   * 完成时间
   *
   * @author zyl
   * @type {Date}
   */
finished_time_: Date,


  /**
   * 等待时长
   *
   * @author zyl
   * @type {number}
   */
waiting_time_: number,


  /**
   * 维修时长
   *
   * @author zyl
   * @type {number}
   */
overhaul_time_: number,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 事务总线id
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 维修状态
   *
   * @author zyl
   * @see {OverhaulStatus}
   * @type {string}
   */
overhaul_status_: string,


  /**
   * 申请人
   *
   * @author zyl
   * @type {string}
   */
f_applicant_i24v: string,


}


/**
 *模型名称：SN维修任务
 *模型KEY:em_sn_overhaul_task
 */
interface SnOverhaulTaskMethods extends IModelService<SnOverhaulTask> {
}
