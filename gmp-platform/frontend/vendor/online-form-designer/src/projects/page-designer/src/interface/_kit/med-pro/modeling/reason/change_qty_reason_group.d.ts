import {CommonFields ,NdoFields} from '../parent'

interface ChangeQtyReasonGroup extends   NdoFields,CommonFields {
  /**
   * 原因配置
   *
   * @author zyl
   * @see {ChangeQtyReasonGroupEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：批次数量调整原因组
 *模型KEY:em_change_qty_reason_group
 */
interface ChangeQtyReasonGroupMethods extends IModelService<ChangeQtyReasonGroup> {
}
