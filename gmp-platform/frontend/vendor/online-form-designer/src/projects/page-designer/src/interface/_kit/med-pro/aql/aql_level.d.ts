import {CommonFields ,NdoFields} from '../parent'

interface AqlLevel extends   NdoFields,CommonFields {
  /**
   * AQL级别配置
   *
   * @author zyl
   * @see {AqlLevelEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：AQL级别
 *模型KEY:em_aql_level
 */
interface AqlLevelMethods extends IModelService<AqlLevel> {
}
