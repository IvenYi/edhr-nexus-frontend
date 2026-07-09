import {CommonFields } from '../parent'

interface TxnMainline extends CommonFields {
  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 关联2ID
   *
   * @author zyl
   * @type {string}
   */
sec_relation_id_: string,


  /**
   * 治具(多选)
   *
   * @author zyl
   * @see {Fixture}
   * @type {string}
   */
fixture_ids_: string,


  /**
   * 治具
   *
   * @author zyl
   * @see {Fixture}
   * @type {string}
   */
fixture_id_: string,


  /**
   * 事务主体ID
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 事务ID
   *
   * @author zyl
   * @type {number}
   */
txn_id_: number,


  /**
   * 事务key
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 电子签名关联ID
   *
   * @author zyl
   * @type {string}
   */
relation_id_: string,


  /**
   * 电子签名需求ID
   *
   * @author zyl
   * @see {SignRequirement}
   * @type {string}
   */
sign_requirement_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 工艺步骤iD
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 工站
   *
   * @author zyl
   * @see {Operation}
   * @type {string}
   */
operation_id_: string,


  /**
   * 设备组
   *
   * @author zyl
   * @see {DeviceGroup}
   * @type {string}
   */
device_group_id_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
workflow_id_: string,


  /**
   * 工步别名
   *
   * @author zyl
   * @type {string}
   */
workflow_step_alias_id_: string,


  /**
   * 描述
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 设备多选
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_ids_: string,


}


/**
 *模型名称：事务总线
 *模型KEY:em_txn_mainline
 */
interface TxnMainlineMethods extends IModelService<TxnMainline> {
  /**
   * 结束复合事务
   *
   * @param 
   * @return void
   */
endCompoundTxn():void;


  /**
   * 获取事务ID
   *
   * @param 
   * @return string
   */
getTxnId():string;


  /**
   * 开启复合事务
   *
   * @param 
   * @return void
   */
startCompoundTxn():void;


}
