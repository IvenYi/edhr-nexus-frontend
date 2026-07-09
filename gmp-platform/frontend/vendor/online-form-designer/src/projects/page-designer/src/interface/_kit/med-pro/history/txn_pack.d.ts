import {CommonFields, ExecuteParams } from '../parent'

interface TxnPack extends CommonFields {
  /**
   * 条码
   *
   * @author zyl
   * @type {string}
   */
bar_code_: string,


  /**
   * 工艺步骤iD
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 包装类型
   *
   * @author zyl
   * @see {PackageType}
   * @type {string}
   */
pack_type_: string,


  /**
   * 包装明细
   *
   * @author zyl
   * @see {TxnPackDetail}
   * @type {string}
   */
entries_: string,


  /**
   * 事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 事务主体ID
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 包装规则明细
   *
   * @author zyl
   * @see {OrderPackageRuleEntry}
   * @type {string}
   */
order_pack_rule_entry_id_: string,


}


/**
 *模型名称：包装
 *模型KEY:em_txn_pack
 */
interface TxnPackMethods extends IModelService<TxnPack> {
  /**
   * 创建关联型或拓展型批次
   *
   * @param1 containerId 批次id
   * @param2 barCode 包装条码
   * @param3 orderPackageRuleId 工单包装规则配置id
   * @return string
   */
createAssociationOrExpansionContainer(containerId:string,barCode:string,orderPackageRuleId:string):string;


  /**
   * 创建拆分型批次
   *
   * @param1 containerId 批次id
   * @param2 children 子批次数据
   * @return void
   */
createSplitContainer(containerId:string,children:Object[]):void;


  /**
   * 生成关联型或拓展型UDI
   *
   * @param 
   * @return void
   */
generateAssociationOrExpansionUdi():void;


  /**
   * 生成拆分型UDI
   *
   * @param 
   * @return void
   */
generateSplitUdi():void;


  /**
   * 刷新报表树
   *
   * @param1 mainContainerId 主批次id
   * @param2 containerInfoList 子批次数据
   * @return void
   */
updateReportTree(mainContainerId:string,containerInfoList:Container[]):void;


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
