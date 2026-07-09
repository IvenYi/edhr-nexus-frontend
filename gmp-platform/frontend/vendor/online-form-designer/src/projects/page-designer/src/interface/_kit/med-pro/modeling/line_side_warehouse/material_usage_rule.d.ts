import {CommonFields } from '../parent'

interface MaterialUsageRule extends CommonFields {
  /**
   * 物料批次号规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
material_sn_rule_id_: string,


  /**
   * 物料标签
   *
   * @author zyl
   * @see {LabelTemplate}
   * @type {string}
   */
material_label_template_id_: string,


  /**
   * 入库编码规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
inbound_sn_rule_id_: string,


  /**
   * 入库标签
   *
   * @author zyl
   * @see {LabelTemplate}
   * @type {string}
   */
inbound_label_template_id_: string,


  /**
   * 库存预警
   *
   * @author zyl
   * @see {InventoryWarningUsageRule}
   * @type {string}
   */
inventory_warning_usage_rule_id_: string,


  /**
   * 检验单
   *
   * @author zyl
   * @see {Checklist}
   * @type {string}
   */
checklist_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 检验单编码规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
checklist_sn_rule_id_: string,


  /**
   * 领料规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
receive_material_sn_rule_id_: string,


  /**
   * 退料规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
return_material_sn_rule_id_: string,


  /**
   * 打印服务
   *
   * @author zyl
   * @type {string}
   */
print_service_: string,


  /**
   * 在线表单模版
   *
   * @author zyl
   * @type {string}
   */
online_form_tmpl_id_: string,


  /**
   * 出库规则设置
   *
   * @author zyl
   * @see {OutboundUsageRule}
   * @type {string}
   */
outbound_usage_rule_id_: string,


  /**
   * 入库标签
   *
   * @author zyl
   * @type {string}
   */
inbound_label_id_: string,


  /**
   * 物料标签
   *
   * @author zyl
   * @type {string}
   */
material_label_id_: string,


}


/**
 *模型名称：物料使用规则
 *模型KEY:em_material_usage_rule
 */
interface MaterialUsageRuleMethods extends IModelService<MaterialUsageRule> {
  /**
   * 批次物料使用规则
   *
   * @param1 productId 产品id
   * @return MaterialUsageRule
   */
match(productId:string):MaterialUsageRule;


  /**
   * 发送库存告警通知
   *
   * @param1 productId 产品id
   * @param2 remaining 告警数量
   * @return void
   */
sendInventoryWarning(productId:string,remaining:number):void;


}
