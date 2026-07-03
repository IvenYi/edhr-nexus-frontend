import {CommonFields ,NdoFields} from '../parent'

interface SwitchRule extends   NdoFields,CommonFields {
  /**
   * 切换规则
   *
   * @author zyl
   * @see {SwitchRuleEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：切换规则
 *模型KEY:em_switch_rule
 */
interface SwitchRuleMethods extends IModelService<SwitchRule> {
  /**
   * 切换规则是否满足持续时间
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 samplingPlanEntryId 采样计划详情id
   * @return boolean
   */
isMeetDuration(containerId:string,workflowStepId:string,samplingPlanEntryId:string):boolean;


  /**
   * 是否满足通过失败数量
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 switchRuleEntryMap 切换规则详情
   * @return boolean
   */
isMeetPassFailQty(containerId:string,workflowStepId:string,switchRuleEntryMap:object):boolean;


}
