import {CommonFields } from '../parent'

interface TxnRef extends CommonFields {
  /**
   * 事务起点
   *
   * @author zyl
   * @type {number}
   */
txn_start_id_: number,


  /**
   * 事务终点
   *
   * @author zyl
   * @type {number}
   */
txn_end_id_: number,


  /**
   * 事务主体ID
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 需要追溯的主体ID
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
txn_tracking_id_: string,


}


/**
 *模型名称：事务追溯
 *模型KEY:em_txn_ref
 */
interface TxnRefMethods extends IModelService<TxnRef> {
  /**
   * 添加事务点追溯记录
   *
   * @param1 trackingId 需要追溯的事务id
   * @param2 subjectId 事务主体id
   * @return void
   */
addPointRef(trackingId:string,subjectId:string):void;


  /**
   * 添加事务点追溯记录
   *
   * @param1 trackingIds 需要追溯的事务id
   * @param2 subjectId 事务主体id
   * @return void
   */
addPointRefBatch(trackingIds:string[],subjectId:string):void;


  /**
   * 关联父级
   *
   * @param1 parentSubjectId 父事务主体id
   * @return void
   */
associate(parentSubjectId:string):void;


  /**
   * 反向关联
   *
   * @param1 parentSubjectId 父事务主体id
   * @return void
   */
associateReverse(parentSubjectId:string):void;


  /**
   * 创建事务主体追溯记录
   *
   * @param1 parentSubjectId 父事务主体id
   * @param2 children 子批次数据
   * @return void
   */
createSubjectRef(parentSubjectId:string,children:Container[]):void;


  /**
   * 创建事务主体追溯记录
   *
   * @param1 subjectId 事务主体id集合
   * @param2 startTxnId 开始事务id
   * @return void
   */
createSubjectRefBatch(subjectId:string[],startTxnId:string):void;


  /**
   * 解除关联
   *
   * @param 
   * @return void
   */
disassociate():void;


  /**
   * 解除反向关联
   *
   * @param1 parentSubjectId 父事务主体id
   * @param2 children 子批次数据
   * @return void
   */
disassociateReverse(parentSubjectId:string,children:Container[]):void;


  /**
   * 继承事务记录
   *
   * @param1 subjectId 事务主体id
   * @param2 parentSubjectId 父事务主体id
   * @return void
   */
inheritRef(subjectId:string,parentSubjectId:string):void;


  /**
   * 继承事务记录
   *
   * @param1 subjectId 事务主体id集合
   * @param2 parentSubjectId 父事务主体id
   * @param3 startTxnId 开始事务id
   * @return void
   */
inheritRefBatch(subjectId:string[],parentSubjectId:string,startTxnId:string):void;


}
