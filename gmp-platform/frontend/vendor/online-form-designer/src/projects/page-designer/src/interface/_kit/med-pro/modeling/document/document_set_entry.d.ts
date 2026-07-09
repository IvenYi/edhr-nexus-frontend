import {CommonFields } from '../parent'

interface DocumentSetEntry extends CommonFields {
  /**
   * 文档
   *
   * @author zyl
   * @see {Document}
   * @type {string}
   */
document_id_: string,


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
   * 引用主模型数据 id
   *
   * @author zyl
   * @type {string}
   */
ref_master_id_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：文档集配置项
 *模型KEY:em_document_set_entry
 */
interface DocumentSetEntryMethods extends IModelService<DocumentSetEntry> {
}
