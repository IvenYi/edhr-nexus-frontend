import {CommonFields ,NdoFields} from '../parent'

interface ReworkReasonGroup extends   NdoFields,CommonFields {
  /**
   * 原因配置
   *
   * @author zyl
   * @see {ReworkReasonGroupEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：返工原因组
 *模型KEY:em_rework_reason_group
 */
interface ReworkReasonGroupMethods extends IModelService<ReworkReasonGroup> {
}
