import {CommonFields ,NdoFields} from '../parent'

interface NotGoodGroup extends   NdoFields,CommonFields {
  /**
   * 不良分类原因项
   *
   * @author zyl
   * @see {NotGoodGroupEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：不良分类
 *模型KEY:em_not_good_group
 */
interface NotGoodGroupMethods extends IModelService<NotGoodGroup> {
}
