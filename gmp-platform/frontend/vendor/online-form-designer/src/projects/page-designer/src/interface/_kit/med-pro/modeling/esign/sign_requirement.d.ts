import {CommonFields ,NdoFields} from '../parent'

interface SignRequirement extends   NdoFields,CommonFields {
  /**
   * 签名需求配置
   *
   * @author zyl
   * @see {SignRequirementEntry}
   * @type {string}
   */
entries_: string,


  /**
   * 签名方式
   *
   * @author zyl
   * @see {SignMethod}
   * @type {string}
   */
sign_method_: string,


  /**
   * 复核签名配置项
   *
   * @author zyl
   * @see {SignRequirementEntry}
   * @type {string}
   */
review_entries_: string,


  /**
   * 复核签名
   *
   * @author zyl
   * @type {boolean}
   */
review_enabled_: boolean,


}


/**
 *模型名称：签名需求
 *模型KEY:em_sign_requirement
 */
interface SignRequirementMethods extends IModelService<SignRequirement> {
}
