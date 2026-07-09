import {CommonFields } from '../parent'

interface MaterialContainerSplit extends CommonFields {
  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 拆分原因
   *
   * @author zyl
   * @see {ContainerSplitReason}
   * @type {string}
   */
split_reason_id_: string,


  /**
   * 拆分明细
   *
   * @author zyl
   * @see {MaterialContainerSplitEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：物料批次拆分
 *模型KEY:em_material_container_split
 */
interface MaterialContainerSplitMethods extends IModelService<MaterialContainerSplit> {
}
