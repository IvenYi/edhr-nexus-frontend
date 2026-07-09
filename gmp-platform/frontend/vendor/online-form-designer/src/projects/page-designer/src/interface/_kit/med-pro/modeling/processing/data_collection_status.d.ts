/**
 *模型名称：数据采集状态
 *模型KEY:enu_data_collection_status
 */
interface DataCollectionStatus{
  /**
   * 未填报
   *
   * @author zyl
   * @type {string}
   */
initial: string,


  /**
   * 暂存
   *
   * @author zyl
   * @type {string}
   */
stash: string,


  /**
   * 已提交
   *
   * @author zyl
   * @type {string}
   */
submitted: string,


}
