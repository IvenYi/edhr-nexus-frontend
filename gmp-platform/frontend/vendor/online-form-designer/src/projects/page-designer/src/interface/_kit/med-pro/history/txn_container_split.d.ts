import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerSplit extends CommonFields {
  /**
   * 事务总线
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
   * 拆分明细
   *
   * @author zyl
   * @see {TxnContainerSplitDetail}
   * @type {string}
   */
entries_: string,


  /**
   * 批次拆分原因
   *
   * @author zyl
   * @see {ContainerSplitReason}
   * @type {string}
   */
f_container_split_r6df: string,


  /**
   * 数量为0自动关闭
   *
   * @author zyl
   * @type {boolean}
   */
close_when_empty_: boolean,


}


/**
 *模型名称：批次拆分
 *模型KEY:em_txn_container_split
 */
interface TxnContainerSplitMethods extends IModelService<TxnContainerSplit> {
  /**
   * 创建批次
   *
   * @param1 containerId 批次id
   * @param2 children 子批次数据
   * @return void
   */
createContainer(containerId:string,children:Object[]):void;


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 继承时间窗计时
   *
   * @param1 containerId 被继承批次id
   * @param2 toContainer 继承批次id
   * @return void
   */
inheritTiming(containerId:string,toContainer:string):void;


  /**
   * 继承时间窗计时
   *
   * @param1 containerId 被继承批次id
   * @param2 toContainer 继承批次id
   * @return void
   */
inheritTimingBatch(containerId:string,toContainer:string[]):void;


  /**
   * 拷贝生产时间记录
   *
   * @param1 containerId 被拷贝批次id
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copyProcessTimes(containerId:string,toContainerId:string):void;


  /**
   * 拷贝生产时间记录
   *
   * @param1 containerId 被拷贝批次id
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copyProcessTimesBatch(containerId:string,toContainerId:string[]):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
