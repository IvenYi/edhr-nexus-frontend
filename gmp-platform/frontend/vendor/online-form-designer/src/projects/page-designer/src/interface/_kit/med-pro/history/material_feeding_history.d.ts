import {CommonFields } from '../parent'

interface MaterialFeedingHistory extends CommonFields {
  /**
   * 总投入量
   *
   * @author zyl
   * @type {number}
   */
total_qty_: number,


  /**
   * 工艺步骤iD
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 事务总线
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 投料方式
   *
   * @author zyl
   * @see {FeedingType}
   * @type {string}
   */
feeding_type_: string,


  /**
   * 投料范围
   *
   * @author zyl
   * @see {FeedingRange}
   * @type {string}
   */
feeding_range_: string,


  /**
   * 投料批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


  /**
   * 主批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
to_container_id_: string,


  /**
   * 投入量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 总投入量上限
   *
   * @author zyl
   * @type {number}
   */
max_total_value_: number,


  /**
   * 总投入量下限
   *
   * @author zyl
   * @type {number}
   */
min_total_value_: number,


  /**
   * 批次号
   *
   * @author zyl
   * @type {string}
   */
container_name_: string,


  /**
   * 工单配方详情
   *
   * @author zyl
   * @see {MfgOrderRecipe}
   * @type {string}
   */
order_recipe_entry_id_: string,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 投料顺序
   *
   * @author zyl
   * @type {number}
   */
feeding_sort_: number,


  /**
   * 配方详情
   *
   * @author zyl
   * @see {RecipeEntry}
   * @type {string}
   */
recipe_entry_id_: string,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


}


/**
 *模型名称：配方投料历史
 *模型KEY:em_material_feeding_history
 */
interface MaterialFeedingHistoryMethods extends IModelService<MaterialFeedingHistory> {
  /**
   * 计算总投入量以及上下限
   *
   * @param1 containerId 批次id
   * @param2 recipeMap 配方详情数据
   * @return Object
   */
calculateMaxAndMinValue(containerId:string,recipeMap:RecipeEntry):Object;


}
