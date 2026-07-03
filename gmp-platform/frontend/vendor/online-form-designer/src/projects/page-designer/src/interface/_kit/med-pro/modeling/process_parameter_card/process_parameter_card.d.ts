import {CommonFields ,RdoFields} from '../parent'

interface ProcessParameterCard extends RdoFields,CommonFields {
  /**
   * 配置项
   *
   * @author zyl
   * @see {ProcessParameterCardEntry}
   * @type {string}
   */
entries_: string,


  /**
   * 应用状态
   *
   * @author zyl
   * @see {UsageStatus}
   * @type {string}
   */
status_: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


}


/**
 *模型名称：工艺参数卡
 *模型KEY:em_process_parameter_card
 */
interface ProcessParameterCardMethods extends IRdoModelService<ProcessParameterCard> {
}
