import {CommonFields } from '../parent'

interface FixtureOverhaulTask extends CommonFields {
  /**
   * 治具
   *
   * @author zyl
   * @see {Fixture}
   * @type {string}
   */
fixture_id_: string,


  /**
   * 备注
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 同行人员
   *
   * @author zyl
   * @type {string}
   */
together_user_id_: string,


  /**
   * 维修状态
   *
   * @author zyl
   * @see {OverhaulStatus}
   * @type {string}
   */
overhaul_status_: string,


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
   * 工装治具家族
   *
   * @author zyl
   * @see {FixtureFamily}
   * @type {string}
   */
fixture_family_id_: string,


}


/**
 *模型名称：治具维修任务
 *模型KEY:em_fixture_overhaul_task
 */
interface FixtureOverhaulTaskMethods extends IModelService<FixtureOverhaulTask> {
}
