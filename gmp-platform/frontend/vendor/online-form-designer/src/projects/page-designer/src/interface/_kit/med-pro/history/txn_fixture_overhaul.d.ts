import {CommonFields, ExecuteParams } from '../parent'

interface TxnFixtureOverhaul extends CommonFields {
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


}


/**
 *模型名称：治具维修
 *模型KEY:em_txn_fixture_overhaul
 */
interface TxnFixtureOverhaulMethods extends IModelService<TxnFixtureOverhaul> {
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
