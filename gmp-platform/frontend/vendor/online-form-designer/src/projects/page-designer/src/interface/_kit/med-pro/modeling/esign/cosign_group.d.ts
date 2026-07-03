import {CommonFields ,NdoFields} from '../parent'

interface CosignGroup extends   NdoFields,CommonFields {
  /**
   * 人员配置
   *
   * @author zyl
   * @see {CosignGroupEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：会签组
 *模型KEY:em_cosign_group
 */
interface CosignGroupMethods extends IModelService<CosignGroup> {
}
