import {CommonFields } from '../parent'

interface MaterialContainerSplitEntry extends CommonFields {
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
   * 引用主模型字段key
   *
   * @author zyl
   * @type {string}
   */
ref_field_key_: string,


  /**
   * 数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


}


/**
 *模型名称：物料批次拆分详情
 *模型KEY:em_material_container_split_entry
 */
interface MaterialContainerSplitEntryMethods extends IModelService<MaterialContainerSplitEntry> {
}
