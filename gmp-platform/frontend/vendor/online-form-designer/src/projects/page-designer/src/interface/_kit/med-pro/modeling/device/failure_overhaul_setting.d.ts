import {CommonFields ,NdoFields} from '../parent'

interface FailureOverhaulSetting extends   NdoFields,CommonFields {
  /**
   * 申请通知配置项
   *
   * @author zyl
   * @see {FailureOverhaulSettingEntry}
   * @type {string}
   */
apply_entries_: string,


  /**
   * 响应时长配置项
   *
   * @author zyl
   * @see {FailureOverhaulSettingEntry}
   * @type {string}
   */
response_entries_: string,


  /**
   * 维修时长配置项
   *
   * @author zyl
   * @see {FailureOverhaulSettingEntry}
   * @type {string}
   */
overhaul_entries_: string,


}


/**
 *模型名称：故障维修设置
 *模型KEY:em_failure_overhaul_setting
 */
interface FailureOverhaulSettingMethods extends IModelService<FailureOverhaulSetting> {
}
