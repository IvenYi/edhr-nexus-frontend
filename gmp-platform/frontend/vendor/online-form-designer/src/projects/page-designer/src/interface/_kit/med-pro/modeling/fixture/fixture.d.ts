import {CommonFields ,NdoFields} from '../parent'

interface Fixture extends   NdoFields,CommonFields {
  /**
   * 工装治具状态
   *
   * @author zyl
   * @see {FixtureStatus}
   * @type {string}
   */
status_: string,


  /**
   * 工装治具家族
   *
   * @author zyl
   * @see {FixtureFamily}
   * @type {string}
   */
fixture_family_id_: string,


  /**
   * 工装治具类型
   *
   * @author zyl
   * @see {FixtureType}
   * @type {string}
   */
fixture_type_id_: string,


  /**
   * SN号
   *
   * @author zyl
   * @type {string}
   */
serial_number_: string,


  /**
   * 容量
   *
   * @author zyl
   * @type {string}
   */
capacity_: string,


  /**
   * 寿命次数
   *
   * @author zyl
   * @type {number}
   */
life_times_: number,


  /**
   * 寿命结束时间
   *
   * @author zyl
   * @type {Date}
   */
life_end_time_: Date,


  /**
   * 使用次数
   *
   * @author zyl
   * @type {number}
   */
use_times_: number,


  /**
   * 工装治具配置项
   *
   * @author zyl
   * @see {FixtureConfigEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：工装治具
 *模型KEY:em_fixture
 */
interface FixtureMethods extends IModelService<Fixture> {
  /**
   * 计算治具使用次数
   *
   * @param1 fixtureIdList 治具id数组
   * @param2 containerId 批次id
   * @return void
   */
plusUseTimesOfFixture(fixtureIdList:string[],containerId:string):void;


}
