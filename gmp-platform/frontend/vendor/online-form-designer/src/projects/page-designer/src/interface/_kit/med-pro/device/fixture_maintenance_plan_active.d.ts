import {CommonFields ,NdoFields} from '../parent'

interface FixtureMaintenancePlanActive extends   NdoFields,CommonFields {
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
   * 激活时间
   *
   * @author zyl
   * @type {Date}
   */
active_time_: Date,


  /**
   * 备注
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 保养计划
   *
   * @author zyl
   * @see {MaintenancePlan}
   * @type {string}
   */
maintenance_plan_id_: string,


  /**
   * 激活状态
   *
   * @author zyl
   * @type {boolean}
   */
active_: boolean,


}


/**
 *模型名称：治具保养计划激活
 *模型KEY:em_fixture_maintenance_plan_active
 */
interface FixtureMaintenancePlanActiveMethods extends IModelService<FixtureMaintenancePlanActive> {
}
