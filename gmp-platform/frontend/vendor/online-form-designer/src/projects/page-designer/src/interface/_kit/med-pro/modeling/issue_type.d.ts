/**
 *模型名称：分发类型
 *模型KEY:enu_issue_type
 */
interface IssueType{
  /**
   * 仅数量
   *
   * @author zyl
   * @type {string}
   */
onlyQty: string,


  /**
   * 仅显示
   *
   * @author zyl
   * @type {string}
   */
onlyShow: string,


  /**
   * 按批次和库存点
   *
   * @author zyl
   * @type {string}
   */
containerAndStore: string,


  /**
   * 按序列号分发
   *
   * @author zyl
   * @type {string}
   */
sequence: string,


  /**
   * 按批次分发
   *
   * @author zyl
   * @type {string}
   */
container: string,


}
