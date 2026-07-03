import {CommonFields ,RdoFields} from '../parent'

interface Product extends RdoFields,CommonFields {
  /**
   * 产品编码
   *
   * @author zyl
   * @type {string}
   */
code_: string,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 产品家族
   *
   * @author zyl
   * @see {ProductFamily}
   * @type {string}
   */
product_family_id_: string,


  /**
   * 产品类型
   *
   * @author zyl
   * @see {ProductType}
   * @type {string}
   */
product_type_: string,


  /**
   * 物料清单
   *
   * @author zyl
   * @see {Bom}
   * @type {string}
   */
bom_id_: string,


  /**
   * 培训需求组
   *
   * @author zyl
   * @see {TrainingRequirementGroup}
   * @type {string}
   */
training_requirement_group_id_: string,


  /**
   * 流水码
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
sn_rule_id_: string,


  /**
   * 文档集
   *
   * @author zyl
   * @see {DocumentSet}
   * @type {string}
   */
document_set_id_: string,


  /**
   * 工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
workflow_id_: string,


  /**
   * 有效期开始时间
   *
   * @author zyl
   * @type {Date}
   */
expired_start_at_: Date,


  /**
   * 有效期截止时间
   *
   * @author zyl
   * @type {Date}
   */
expired_end_at_: Date,


  /**
   * 免检
   *
   * @author zyl
   * @type {boolean}
   */
exempt_: boolean,


  /**
   * 包装规则
   *
   * @author zyl
   * @see {PackageRule}
   * @type {string}
   */
package_rule_id_: string,


  /**
   * 配方
   *
   * @author zyl
   * @see {Recipe}
   * @type {string}
   */
recipe_id_: string,


  /**
   * 产品有效期时长
   *
   * @author zyl
   * @type {number}
   */
expiration_date_: number,


  /**
   * 时长单位
   *
   * @author zyl
   * @see {DurationUnit}
   * @type {string}
   */
duration_unit_: string,


  /**
   * 产品规格
   *
   * @author zyl
   * @type {string}
   */
f_specification_r6df: string,


  /**
   * 采样计划
   *
   * @author zyl
   * @see {SamplingPlan}
   * @type {string}
   */
sampling_plan_id_: string,


  /**
   * 故障维修设置
   *
   * @author zyl
   * @see {FailureOverhaulSetting}
   * @type {string}
   */
failure_overhaul_setting_id_: string,


  /**
   * 是否主物料
   *
   * @author zyl
   * @type {boolean}
   */
is_main_material_: boolean,


}


/**
 *模型名称：产品信息
 *模型KEY:em_product
 */
interface ProductMethods extends IRdoModelService<Product> {
  /**
   * 获取流水码规则Id
   *
   * @param1 productId 产品id
   * @return string
   */
getSnRuleId(productId:string):string;


  /**
   * 获取前N条版本
   *
   * @param1 n n个版本
   * @return Product[]
   */
getTopVersions(n:number):Product[];


  /**
   * 根据名称获取产品默认版本
   *
   * @param1 names 产品名称数组
   * @return Product[]
   */
listDefaultVersionByNames(names:string[]):Product[];


  /**
   * 批量更新产品版本
   *
   * @param1 productList 产品数组
   * @return void
   */
updateVersionBatch(productList:Product[]):void;


}
