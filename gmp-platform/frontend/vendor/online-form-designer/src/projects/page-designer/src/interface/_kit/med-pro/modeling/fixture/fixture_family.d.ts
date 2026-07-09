import {CommonFields ,NdoFields} from '../parent'

interface FixtureFamily extends   NdoFields,CommonFields {
  /**
   * 治具配置
   *
   * @author zyl
   * @see {FixtureFamilyEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：工装治具家族
 *模型KEY:em_fixture_family
 */
interface FixtureFamilyMethods extends IModelService<FixtureFamily> {
}
