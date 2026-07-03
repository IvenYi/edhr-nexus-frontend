import {CommonFields, ExecuteParams } from '../parent'

interface TxnPackChange extends CommonFields {
  /**
   * 当前条码
   *
   * @author zyl
   * @type {string}
   */
current_code_: string,


  /**
   * 变更后条码
   *
   * @author zyl
   * @type {string}
   */
new_code_: string,


  /**
   * 包装变更类型
   *
   * @author zyl
   * @see {PackageType}
   * @type {string}
   */
pack_type_: string,


  /**
   * 包装变更明细
   *
   * @author zyl
   * @see {TxnPackChangeDetail}
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
   * 包装事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
pack_mainline_id_: string,


  /**
   * 事务主体ID
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 变更后数量
   *
   * @author zyl
   * @type {number}
   */
new_qty_: number,


  /**
   * 当前数量
   *
   * @author zyl
   * @type {number}
   */
current_qty_: number,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 是否变更包装条码
   *
   * @author zyl
   * @type {boolean}
   */
change_code_: boolean,


  /**
   * 是否打印
   *
   * @author zyl
   * @type {boolean}
   */
print_: boolean,


}


/**
 *模型名称：包装变更
 *模型KEY:em_txn_pack_change
 */
interface TxnPackChangeMethods extends IModelService<TxnPackChange> {
  /**
   * 获取包装信息
   *
   * @param1 containerId 批次id
   * @param2 queryBodyMap 查询条件
   * @return TxnPackChangeDetail|TxnPackDetail[]
   */
getPackageInfo(containerId:string,queryBodyMap:Object):TxnPackChangeDetail|TxnPackDetail[];


  /**
   * 包装层级树变更
   *
   * @param1 packChangeMap 包装变更数据
   * @return void
   */
updatePackChange(packChangeMap:Object):void;


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
