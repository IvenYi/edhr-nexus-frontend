import {CommonFields } from '../parent'

interface BomMaterialContainerEntry extends CommonFields {
  /**
   * 指定物料批次
   *
   * @author zyl
   * @type {string}
   */
container_name_: string,


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
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：工单BOM指定批次
 *模型KEY:em_bom_material_container_entry
 */
interface BomMaterialContainerEntryMethods extends IModelService<BomMaterialContainerEntry> {
}
