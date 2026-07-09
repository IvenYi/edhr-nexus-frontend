/**
 *模型名称：物料出库类型
 *模型KEY:enu_material_outbound_type
 */
interface MaterialOutboundType{
  /**
   * 领料出库
   *
   * @author zyl
   * @type {string}
   */
requisition: string,


  /**
   * 物料分发
   *
   * @author zyl
   * @type {string}
   */
materialIssue: string,


  /**
   * 配方投料
   *
   * @author zyl
   * @type {string}
   */
materialFeeding: string,


}
