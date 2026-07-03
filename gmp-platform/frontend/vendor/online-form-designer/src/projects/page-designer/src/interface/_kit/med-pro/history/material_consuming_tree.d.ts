import {CommonFields } from '../parent'

interface MaterialConsumingTree extends CommonFields {
  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


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
   * @see {MaterialConsumingTree}
   * @type {string}
   */
parent_id_: string,


  /**
   * 节点层级
   *
   * @author zyl
   * @type {number}
   */
level_: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：物料消耗层级树
 *模型KEY:em_material_consuming_tree
 */
interface MaterialConsumingTreeMethods extends IModelService<MaterialConsumingTree> {
  /**
   * 增加层级
   *
   * @param1 mainContainerId 主批次id
   * @param2 materialContainerInfoList 物料批次数据
   * @return void
   */
addLevel(mainContainerId:string,materialContainerInfoList:Container[]):void;


}
