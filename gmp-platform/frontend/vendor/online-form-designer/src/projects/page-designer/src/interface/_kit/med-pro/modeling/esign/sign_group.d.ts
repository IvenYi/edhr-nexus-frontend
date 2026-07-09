import {CommonFields ,NdoFields} from '../parent'

interface SignGroup extends   NdoFields,CommonFields {
  /**
   * 人员配置
   *
   * @author zyl
   * @see {SignGroupEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：签名组
 *模型KEY:em_sign_group
 */
interface SignGroupMethods extends IModelService<SignGroup> {
}
