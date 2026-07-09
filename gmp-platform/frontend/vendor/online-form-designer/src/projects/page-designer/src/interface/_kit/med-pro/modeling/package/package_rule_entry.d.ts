import {CommonFields } from '../parent'

interface PackageRuleEntry extends CommonFields {
  /**
   * 引用主模型字段key
   *
   * @author zyl
   * @type {string}
   */
ref_field_key_: string,


  /**
   * 引用主模型数据 id
   *
   * @author zyl
   * @type {string}
   */
ref_master_id_: string,


  /**
   * 引用主模型key
   *
   * @author zyl
   * @type {string}
   */
ref_model_key_: string,


  /**
   * 包装方式
   *
   * @author zyl
   * @see {PackageType}
   * @type {string}
   */
package_type_: string,


  /**
   * 包装条形码形成方式
   *
   * @author zyl
   * @see {PackageBarCodeType}
   * @type {string}
   */
package_bar_code_type_: string,


  /**
   * From包装层级
   *
   * @author zyl
   * @see {ContainerModality}
   * @type {string}
   */
from_container_modality_id_: string,


  /**
   * To包装层级
   *
   * @author zyl
   * @see {ContainerModality}
   * @type {string}
   */
to_container_modality_id_: string,


  /**
   * From拓展属性
   *
   * @author zyl
   * @see {PackageExpansion}
   * @type {string}
   */
from_expansion_id_: string,


  /**
   * To拓展属性
   *
   * @author zyl
   * @see {PackageExpansion}
   * @type {string}
   */
to_expansion_id_: string,


  /**
   * 包装个数
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 单包数量
   *
   * @author zyl
   * @type {number}
   */
single_package_qty_: number,


  /**
   * 标签模板
   *
   * @author zyl
   * @see {LabelTemplate}
   * @type {string}
   */
label_template_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 流水码规则
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
sn_rule_id_: string,


  /**
   * 指定条码生成方式
   *
   * @author zyl
   * @see {OrderBarCodeType}
   * @type {string}
   */
order_bar_code_type_: string,


  /**
   * 打印服务
   *
   * @author zyl
   * @type {string}
   */
print_service_: string,


  /**
   * 允许不满箱
   *
   * @author zyl
   * @type {boolean}
   */
allow_not_full_box_: boolean,


  /**
   * 允许混产品
   *
   * @author zyl
   * @type {boolean}
   */
allow_mix_product_: boolean,


  /**
   * 标签
   *
   * @author zyl
   * @type {string}
   */
label_id_: string,


  /**
   * 关联型转拓展型
   *
   * @author zyl
   * @type {boolean}
   */
association_to_expansion_: boolean,


  /**
   * 允许混工单
   *
   * @author zyl
   * @type {boolean}
   */
allow_mix_mfg_order_: boolean,


  /**
   * 验证批次完成
   *
   * @author zyl
   * @type {boolean}
   */
validate_container_finished_: boolean,


}


/**
 *模型名称：包装规则配置
 *模型KEY:em_package_rule_entry
 */
interface PackageRuleEntryMethods extends IModelService<PackageRuleEntry> {
  /**
   * 修改条码状态
   *
   * @param1 codeId 条码id
   * @return void
   */
updateToUsed(codeId:string):void;


}
