import {CommonFields } from '../parent'

interface MaterialBasicUsageRule extends CommonFields {
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
   * 入库标签
   *
   * @author zyl
   * @see {LabelTemplate}
   * @type {string}
   */
inbound_label_template_id_: string,


  /**
   * 退料规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
return_material_sn_rule_id_: string,


  /**
   * 领料规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
receive_material_sn_rule_id_: string,


  /**
   * 检验单编码规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
checklist_sn_rule_id_: string,


  /**
   * 物料标签
   *
   * @author zyl
   * @type {string}
   */
material_label_id_: string,


  /**
   * 入库标签
   *
   * @author zyl
   * @type {string}
   */
inbound_label_id_: string,


  /**
   * 库存预警
   *
   * @author zyl
   * @see {InventoryWarningUsageRule}
   * @type {string}
   */
inventory_warning_usage_rule_id_: string,


  /**
   * 出库规则设置
   *
   * @author zyl
   * @see {OutboundUsageRule}
   * @type {string}
   */
outbound_usage_rule_id_: string,


  /**
   * 打印服务
   *
   * @author zyl
   * @type {string}
   */
print_service_: string,


  /**
   * 备品备件领用规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
spare_parts_requisition_sn_rule_id_: string,


}


/**
 *模型名称：物料使用通用规则
 *模型KEY:em_material_basic_usage_rule
 */
interface MaterialBasicUsageRuleMethods extends IModelService<MaterialBasicUsageRule> {
}
