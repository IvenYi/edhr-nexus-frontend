import {CommonFields } from '../parent'

interface SignHistory extends CommonFields {
  /**
   * 关联2ID
   *
   * @author zyl
   * @type {string}
   */
sec_relation_id_: string,


  /**
   * 用户id
   *
   * @author zyl
   * @type {string}
   */
user_id_: string,


  /**
   * 签名需求配追ID
   *
   * @author zyl
   * @type {string}
   */
sign_requirement_config_id_: string,


  /**
   * 会签原因ID
   *
   * @author zyl
   * @see {CosignReason}
   * @type {string}
   */
cosign_reason_id_: string,


  /**
   * 签名账号
   *
   * @author zyl
   * @type {string}
   */
sign_account_: string,


  /**
   * 会签账号
   *
   * @author zyl
   * @type {string}
   */
cosign_account_: string,


  /**
   * 签名图片
   *
   * @author zyl
   * @type {string}
   */
sign_name_: string,


  /**
   * 会签图片
   *
   * @author zyl
   * @type {string}
   */
cosign_name_: string,


  /**
   * 签名需求ID
   *
   * @author zyl
   * @see {SignRequirement}
   * @type {string}
   */
sign_requirement_id_: string,


  /**
   * 关联ID
   *
   * @author zyl
   * @type {string}
   */
relation_id_: string,


  /**
   * 是否复核签名
   *
   * @author zyl
   * @type {boolean}
   */
review_: boolean,


}


/**
 *模型名称：签名历史
 *模型KEY:em_sign_history
 */
interface SignHistoryMethods extends IModelService<SignHistory> {
  /**
   * 如果需要返回签名需求信息
   *
   * @param1 timingId 时间窗id
   * @param2 secRelationId 复合签名id
   * @param3 relationId 完成电子签名标识
   * @return Object
   */
returnSignRequirementInfoIfRequired(timingId:string,secRelationId:string,relationId:string):Object;


  /**
   * 验证签名是否已完成
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return null
   */
validate(containerId:string,workflowStepId:string):null;


  /**
   * 获取签名需求信息
   *
   * @param 
   * @return void
   */
getSignRequirementInfo():void;


}
