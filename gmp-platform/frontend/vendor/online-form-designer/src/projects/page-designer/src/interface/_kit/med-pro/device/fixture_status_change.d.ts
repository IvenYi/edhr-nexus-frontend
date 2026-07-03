import {CommonFields } from '../parent'

interface FixtureStatusChange extends CommonFields {
  /**
   * 治具
   *
   * @author zyl
   * @see {Fixture}
   * @type {string}
   */
fixture_id_: string,


  /**
   * 治具家族
   *
   * @author zyl
   * @see {FixtureFamily}
   * @type {string}
   */
fixture_family_id_: string,


  /**
   * 当前状态变更原因
   *
   * @author zyl
   * @see {ChangeDeviceStatusReason}
   * @type {string}
   */
f_current_change_reason_id_iyhc: string,


  /**
   * 切换原因
   *
   * @author zyl
   * @see {ChangeDeviceStatusReason}
   * @type {string}
   */
f_change_reason_id_iyhc: string,


  /**
   * 变更状态
   *
   * @author zyl
   * @see {FixtureStatus}
   * @type {string}
   */
change_status_: string,


  /**
   * 当前状态
   *
   * @author zyl
   * @see {FixtureStatus}
   * @type {string}
   */
current_status_: string,


}


/**
 *模型名称：治具状态切换
 *模型KEY:em_fixture_status_change
 */
interface FixtureStatusChangeMethods extends IModelService<FixtureStatusChange> {
  /**
   * 治具状态切换
   *
   * @param1 valueMap 工单状态切换数据
   * @return void
   */
changeStatus(valueMap:TxnMfgOrderChange):void;


}
