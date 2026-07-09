import {CommonFields ,NdoFields} from '../parent'

interface FixtureSpotCheckPlanActive extends   NdoFields,CommonFields {
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
   * 点检计划
   *
   * @author zyl
   * @see {CycleSpotCheckPlan}
   * @type {string}
   */
spot_check_plan_id_: string,


  /**
   * 激活时间
   *
   * @author zyl
   * @type {Date}
   */
active_time_: Date,


  /**
   * 激活状态
   *
   * @author zyl
   * @type {boolean}
   */
active_: boolean,


}


/**
 *模型名称：治具点检计划激活
 *模型KEY:em_fixture_spot_check_plan_active
 */
interface FixtureSpotCheckPlanActiveMethods extends IModelService<FixtureSpotCheckPlanActive> {
}
