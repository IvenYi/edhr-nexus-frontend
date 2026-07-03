import {CommonFields ,NdoFields} from '../parent'

interface SamplingMethod extends   NdoFields,CommonFields {
  /**
   * 样本检测类型
   *
   * @author zyl
   * @see {SampleCheckType}
   * @type {string}
   */
sample_check_type_: string,


  /**
   * AQL失败原因组
   *
   * @author zyl
   * @see {ChangeQtyReasonGroup}
   * @type {string}
   */
aql_failure_reason_group_id_: string,


  /**
   * 报废拒收默认原因
   *
   * @author zyl
   * @see {ChangeQtyReason}
   * @type {string}
   */
default_rejection_reason_id_: string,


  /**
   * 样本信息
   *
   * @author zyl
   * @see {SampleInfo}
   * @type {string}
   */
sample_info_id_: string,


  /**
   * 按原因统计废品
   *
   * @author zyl
   * @type {boolean}
   */
statistical_by_reason_enabled_: boolean,


  /**
   * 允许失败出站
   *
   * @author zyl
   * @type {boolean}
   */
allow_failure_move_enabled_: boolean,


  /**
   * 扣除样本数量
   *
   * @author zyl
   * @type {boolean}
   */
reduce_sample_qty_enabled_: boolean,


}


/**
 *模型名称：采样方式
 *模型KEY:em_sampling_method
 */
interface SamplingMethodMethods extends IModelService<SamplingMethod> {
}
