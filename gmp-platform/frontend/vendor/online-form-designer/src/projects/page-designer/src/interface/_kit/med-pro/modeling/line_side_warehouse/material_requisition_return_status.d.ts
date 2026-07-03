/**
 *模型名称：领(退)料状态
 *模型KEY:enu_material_requisition_return_status
 */
interface MaterialRequisitionReturnStatus{
  /**
   * 待执行
   *
   * @author zyl
   * @type {string}
   */
unexecuted: string,


  /**
   * 执行中
   *
   * @author zyl
   * @type {string}
   */
executing: string,


  /**
   * 已完成
   *
   * @author zyl
   * @type {string}
   */
executed: string,


}
