import {CommonFields } from '../parent'

interface PackLevelTree extends CommonFields {
  /**
   * 工单ID
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 批次ID
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 全路径A/B/C
   *
   * @author zyl
   * @type {string}
   */
full_path_: string,


  /**
   * 父节点ID
   *
   * @author zyl
   * @see {PackLevelTree}
   * @type {string}
   */
parent_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 节点层级
   *
   * @author zyl
   * @type {number}
   */
level_: number,


}


/**
 *模型名称：包装层级树
 *模型KEY:em_pack_level_tree
 */
interface PackLevelTreeMethods extends IModelService<PackLevelTree> {
}
