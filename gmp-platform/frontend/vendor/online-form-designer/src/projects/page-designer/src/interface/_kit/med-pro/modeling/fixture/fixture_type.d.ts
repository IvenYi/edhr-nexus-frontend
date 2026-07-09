import {CommonFields ,NdoFields} from '../parent'

interface FixtureType extends   NdoFields,CommonFields {
  /**
   * 治具类型故障维修配置
   *
   * @author zyl
   * @see {DeviceTypeFailureEntry}
   * @type {string}
   */
failure_entries_: string,


}


/**
 *模型名称：工装治具类型
 *模型KEY:em_fixture_type
 */
interface FixtureTypeMethods extends IModelService<FixtureType> {
}
